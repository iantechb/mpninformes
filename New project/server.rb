# frozen_string_literal: true

require "webrick"
require "webrick/httputils"
require "sqlite3"
require "json"
require "securerandom"
require "digest"
require "time"
require "csv"
require "fileutils"
require "base64"

APP_DB_PATH = ENV.fetch("DB_PATH", File.expand_path("db/app.sqlite3", __dir__))
PUBLIC_DIR = File.expand_path("public", __dir__)
DIRECTORY_PATH = File.expand_path("data/district_directory.json", __dir__)
APP_BIND = ENV.fetch("APP_BIND", "127.0.0.1")
APP_PORT = ENV["PORT"] ? ENV["PORT"].to_i : ENV.fetch("APP_PORT", "4567").to_i

DEPARTMENTS = [
  "Presidencia",
  "Secretaria",
  "Tesoreria",
  "Mayordomia",
  "JA",
  "Ministerio Personal",
  "Nuevo Tiempo",
  "Ministerio de la Mujer",
  "Asociacion Ministerial",
  "Ministerio Infantil / del Menor"
].freeze

DEFAULT_ADMIN_USERNAME = ENV.fetch("DEFAULT_ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_PASSWORD = ENV.fetch("DEFAULT_ADMIN_PASSWORD", "AdminMPN2026!")
DEFAULT_PASTOR_PASSWORD = ENV.fetch("DEFAULT_PASTOR_PASSWORD", "PastorMPN2026!")
SESSION_HOURS = 12
SESSION_SECRET = ENV.fetch("SESSION_SECRET", "change-this-secret-in-production")

module Utils
  module_function

  def utc_now
    Time.now.utc.iso8601
  end

  def parse_json_body(req)
    body = req.body.to_s.strip
    return {} if body.empty?
    JSON.parse(body)
  rescue JSON::ParserError
    :invalid_json
  end

  def json(res, status, payload)
    res.status = status
    res["Content-Type"] = "application/json; charset=utf-8"
    res.body = JSON.generate(payload)
  end

  def error(res, status, message)
    json(res, status, { error: message })
  end

  def slugify(text)
    base = text.to_s.downcase
    base = base.gsub(/[^a-z0-9]+/, "-")
    base.gsub(/\A-+|-+\z/, "")
  end

  def password_salt
    SecureRandom.hex(12)
  end

  def password_hash(password, salt)
    Digest::SHA256.hexdigest("#{salt}::#{password}")
  end

  def sign_token(payload)
    Digest::SHA256.hexdigest("#{SESSION_SECRET}::#{payload}")
  end

  def encode_session_token(user_id, expires_epoch)
    payload = "#{user_id}.#{expires_epoch}"
    signature = sign_token(payload)
    Base64.urlsafe_encode64("#{payload}.#{signature}")
  end

  def decode_session_token(token)
    raw = Base64.urlsafe_decode64(token.to_s)
    user_id_str, expires_str, signature = raw.split(".", 3)
    return nil unless user_id_str && expires_str && signature

    payload = "#{user_id_str}.#{expires_str}"
    return nil unless sign_token(payload) == signature

    user_id = user_id_str.to_i
    expires_epoch = expires_str.to_i
    return nil if user_id <= 0
    return nil if expires_epoch <= Time.now.to_i

    { user_id: user_id, expires_epoch: expires_epoch }
  rescue ArgumentError
    nil
  end

  def calc_status(completed, total)
    return "pending" if completed.zero?
    return "completed" if completed == total
    "in-progress"
  end
end

class AppDB
  def initialize(path)
    @db = SQLite3::Database.new(path)
    @db.results_as_hash = true
  end

  def migrate!
    @db.execute_batch <<~SQL
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS districts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        region TEXT NOT NULL,
        district_name TEXT NOT NULL,
        pastor_name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reports (
        district_id INTEGER PRIMARY KEY,
        reports_json TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        updated_by_user_id INTEGER,
        FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
        FOREIGN KEY (updated_by_user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        salt TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        district_id INTEGER,
        display_name TEXT NOT NULL,
        email TEXT,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        FOREIGN KEY (district_id) REFERENCES districts(id)
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    SQL
  end

  def seed!(directory_path)
    district_count = @db.get_first_value("SELECT COUNT(*) FROM districts").to_i
    return unless district_count.zero?

    data = JSON.parse(File.read(directory_path))
    now = Utils.utc_now

    @db.transaction
    data.each_with_index do |row, idx|
      @db.execute(
        "INSERT INTO districts(region, district_name, pastor_name, phone, email, created_at) VALUES(?,?,?,?,?,?)",
        [row["region"], row["districtName"], row["pastorName"], row["phone"], row["email"], now]
      )
      district_id = @db.last_insert_row_id
      reports_json = JSON.generate(DEPARTMENTS.to_h { |d| [d, false] })
      @db.execute(
        "INSERT INTO reports(district_id, reports_json, updated_at, updated_by_user_id) VALUES(?,?,?,NULL)",
        [district_id, reports_json, now]
      )

      username_base = Utils.slugify(row["districtName"])
      username = "#{username_base}-#{idx + 1}"
      salt = Utils.password_salt
      hash = Utils.password_hash(DEFAULT_PASTOR_PASSWORD, salt)
      @db.execute(
        "INSERT INTO users(username, salt, password_hash, role, district_id, display_name, email, created_at) VALUES(?,?,?,?,?,?,?,?)",
        [username, salt, hash, "pastor", district_id, row["pastorName"], row["email"], now]
      )
    end

    salt = Utils.password_salt
    hash = Utils.password_hash(DEFAULT_ADMIN_PASSWORD, salt)
    @db.execute(
      "INSERT INTO users(username, salt, password_hash, role, district_id, display_name, email, created_at) VALUES(?,?,?,?,?,?,?,?)",
      [DEFAULT_ADMIN_USERNAME, salt, hash, "admin", nil, "Administrador MPN", nil, now]
    )

    @db.commit
  rescue StandardError
    @db.rollback
    raise
  end

  def find_user_by_login(login)
    return nil if login.to_s.strip.empty?
    normalized = login.strip.downcase

    user = @db.get_first_row("SELECT * FROM users WHERE lower(username) = ? AND active = 1", [normalized])
    return user if user

    @db.get_first_row(
      "SELECT * FROM users WHERE lower(email) LIKE ? AND active = 1",
      ["%#{normalized}%"]
    )
  end

  def find_user(id)
    @db.get_first_row("SELECT * FROM users WHERE id = ?", [id])
  end

  def create_session(user_id)
    expires_epoch = Time.now.to_i + (SESSION_HOURS * 3600)
    Utils.encode_session_token(user_id, expires_epoch)
  end

  def delete_session(_token); end

  def find_session(token)
    parsed = Utils.decode_session_token(token)
    return nil unless parsed

    user = @db.get_first_row("SELECT * FROM users WHERE id = ? AND active = 1", [parsed[:user_id]])
    return nil unless user

    user.merge(
      "session_token" => token,
      "expires_at" => Time.at(parsed[:expires_epoch]).utc.iso8601
    )
  end

  def user_district_id(user_id)
    @db.get_first_value("SELECT district_id FROM users WHERE id = ?", [user_id])
  end

  def list_districts(filters = {})
    params = []
    where = []

    if filters[:district_id]
      where << "d.id = ?"
      params << filters[:district_id]
    end

    if filters[:query] && !filters[:query].strip.empty?
      q = "%#{filters[:query].strip.downcase}%"
      where << "(lower(d.region) LIKE ? OR lower(d.district_name) LIKE ? OR lower(d.pastor_name) LIKE ? OR lower(IFNULL(d.phone,'')) LIKE ? OR lower(IFNULL(d.email,'')) LIKE ?)"
      params.concat([q, q, q, q, q])
    end

    if filters[:region] && !filters[:region].strip.empty?
      where << "d.region = ?"
      params << filters[:region]
    end

    sql = <<~SQL
      SELECT d.*, r.reports_json, r.updated_at, r.updated_by_user_id
      FROM districts d
      JOIN reports r ON r.district_id = d.id
    SQL

    sql += " WHERE #{where.join(' AND ')}" unless where.empty?
    sql += " ORDER BY d.id ASC"

    rows = @db.execute(sql, params)
    rows.map do |row|
      reports = JSON.parse(row["reports_json"])
      completed = reports.values.count(true)
      total = DEPARTMENTS.length
      percentage = ((completed * 100.0) / total).round
      {
        id: row["id"],
        region: row["region"],
        districtName: row["district_name"],
        pastorName: row["pastor_name"],
        phone: row["phone"].to_s,
        email: row["email"].to_s,
        reports: reports,
        completed: completed,
        total: total,
        percentage: percentage,
        status: Utils.calc_status(completed, total),
        updatedAt: row["updated_at"]
      }
    end
  end

  def update_reports(district_id, reports_hash, user_id)
    filtered = DEPARTMENTS.to_h { |dept| [dept, !!reports_hash[dept]] }
    @db.execute(
      "UPDATE reports SET reports_json = ?, updated_at = ?, updated_by_user_id = ? WHERE district_id = ?",
      [JSON.generate(filtered), Utils.utc_now, user_id, district_id]
    )
  end

  def summary(districts)
    total = districts.length
    completed = districts.count { |d| d[:status] == "completed" }
    in_progress = districts.count { |d| d[:status] == "in-progress" }
    pending = districts.count { |d| d[:status] == "pending" }
    avg = total.zero? ? 0 : (districts.sum { |d| d[:percentage] } / total.to_f).round

    {
      totalDistricts: total,
      completed: completed,
      inProgress: in_progress,
      pending: pending,
      avgProgress: avg
    }
  end

  def regions
    @db.execute("SELECT DISTINCT region FROM districts ORDER BY region ASC").map { |r| r["region"] }
  end

  def list_users
    @db.execute(
      "SELECT id, username, role, district_id, display_name, email, active, created_at FROM users ORDER BY role DESC, id ASC"
    ).map do |row|
      {
        id: row["id"],
        username: row["username"],
        role: row["role"],
        districtId: row["district_id"],
        displayName: row["display_name"],
        email: row["email"].to_s,
        active: row["active"].to_i == 1,
        createdAt: row["created_at"]
      }
    end
  end

  def reset_password(user_id, new_password)
    salt = Utils.password_salt
    hash = Utils.password_hash(new_password, salt)
    @db.execute("UPDATE users SET salt = ?, password_hash = ? WHERE id = ?", [salt, hash, user_id])
  end
end

class ApiServlet < WEBrick::HTTPServlet::AbstractServlet
  def initialize(server, db)
    super(server)
    @db = db
  end

  def do_GET(req, res)
    route(req, res)
  end

  def do_POST(req, res)
    route(req, res)
  end

  def do_PUT(req, res)
    route(req, res)
  end

  private

  def route(req, res)
    path = req.path

    if req.request_method == "POST" && path == "/api/login"
      return login(req, res)
    end

    if req.request_method == "POST" && path == "/api/logout"
      return logout(req, res)
    end

    session_user = require_auth(req, res)
    return unless session_user

    if req.request_method == "GET" && path == "/api/me"
      return Utils.json(res, 200, user_payload(session_user))
    end

    if req.request_method == "GET" && path == "/api/departments"
      return Utils.json(res, 200, { departments: DEPARTMENTS })
    end

    if req.request_method == "GET" && path == "/api/districts"
      return list_districts(req, res, session_user)
    end

    if req.request_method == "GET" && path == "/api/summary"
      return summary(req, res, session_user)
    end

    if req.request_method == "GET" && path == "/api/regions"
      return Utils.json(res, 200, { regions: @db.regions })
    end

    if req.request_method == "PUT" && (m = path.match(%r{\A/api/districts/(\d+)/reports\z}))
      return update_reports(req, res, session_user, m[1].to_i)
    end

    if req.request_method == "GET" && path == "/api/admin/users"
      return admin_users(req, res, session_user)
    end

    if req.request_method == "POST" && path == "/api/admin/reset-password"
      return admin_reset_password(req, res, session_user)
    end

    if req.request_method == "GET" && path == "/api/admin/export.csv"
      return admin_export_csv(req, res, session_user)
    end

    Utils.error(res, 404, "Ruta no encontrada")
  end

  def login(req, res)
    body = Utils.parse_json_body(req)
    return Utils.error(res, 400, "JSON invalido") if body == :invalid_json

    login_value = body["login"].to_s
    password = body["password"].to_s

    user = @db.find_user_by_login(login_value)
    unless user
      return Utils.error(res, 401, "Credenciales incorrectas")
    end

    expected = Utils.password_hash(password, user["salt"])
    unless expected == user["password_hash"]
      return Utils.error(res, 401, "Credenciales incorrectas")
    end

    token = @db.create_session(user["id"])
    cookie = WEBrick::Cookie.new("session_token", token)
    cookie.path = "/"
    cookie.max_age = SESSION_HOURS * 3600
    res.cookies << cookie

    payload = user_payload(user)
    payload[:sessionToken] = token
    Utils.json(res, 200, payload)
  end

  def logout(req, res)
    token = extract_session_token(req)
    @db.delete_session(token) if token

    cookie = WEBrick::Cookie.new("session_token", "")
    cookie.path = "/"
    cookie.max_age = 0
    res.cookies << cookie

    Utils.json(res, 200, { ok: true })
  end

  def extract_session_token(req)
    explicit = req.header["x-session-token"]&.first.to_s.strip
    if explicit.empty?
      explicit = req.meta_vars["HTTP_X_SESSION_TOKEN"].to_s.strip
    end
    return explicit unless explicit.empty?

    auth = req.header["authorization"]&.first.to_s
    if auth.empty?
      auth = req.meta_vars["HTTP_AUTHORIZATION"].to_s
    end
    if auth.start_with?("Bearer ")
      bearer = auth.split(" ", 2)[1].to_s.strip
      return bearer unless bearer.empty?
    end

    req.cookies.find { |c| c.name == "session_token" }&.value
  end

  def require_auth(req, res)
    token = extract_session_token(req)
    user = token ? @db.find_session(token) : nil
    return user if user

    Utils.error(res, 401, "No autenticado")
    nil
  end

  def admin_only(res, user)
    return true if user["role"] == "admin"

    Utils.error(res, 403, "Solo administracion")
    false
  end

  def user_payload(user)
    {
      user: {
        id: user["id"],
        username: user["username"],
        role: user["role"],
        districtId: user["district_id"],
        displayName: user["display_name"],
        email: user["email"].to_s
      },
      defaults: {
        adminUsername: DEFAULT_ADMIN_USERNAME,
        adminPassword: DEFAULT_ADMIN_PASSWORD,
        pastorPassword: DEFAULT_PASTOR_PASSWORD
      }
    }
  end

  def list_districts(req, res, user)
    filters = {
      query: req.query["q"],
      region: req.query["region"]
    }

    if user["role"] == "pastor"
      district_id = user["district_id"]
      filters[:district_id] = district_id
    end

    districts = @db.list_districts(filters)

    if user["role"] == "admin" && req.query["status"] && req.query["status"] != "all"
      districts = districts.select { |d| d[:status] == req.query["status"] }
    end

    Utils.json(res, 200, { districts: districts })
  end

  def summary(_req, res, user)
    if user["role"] == "pastor"
      districts = @db.list_districts(district_id: user["district_id"])
      return Utils.json(res, 200, { summary: @db.summary(districts) })
    end

    districts = @db.list_districts
    Utils.json(res, 200, { summary: @db.summary(districts) })
  end

  def update_reports(req, res, user, district_id)
    if user["role"] == "pastor" && user["district_id"].to_i != district_id
      return Utils.error(res, 403, "No puedes editar otro distrito")
    end

    body = Utils.parse_json_body(req)
    return Utils.error(res, 400, "JSON invalido") if body == :invalid_json

    reports = body["reports"]
    unless reports.is_a?(Hash)
      return Utils.error(res, 400, "Payload invalido")
    end

    @db.update_reports(district_id, reports, user["id"])
    Utils.json(res, 200, { ok: true })
  end

  def admin_users(_req, res, user)
    return unless admin_only(res, user)
    Utils.json(res, 200, { users: @db.list_users })
  end

  def admin_reset_password(req, res, user)
    return unless admin_only(res, user)

    body = Utils.parse_json_body(req)
    return Utils.error(res, 400, "JSON invalido") if body == :invalid_json

    user_id = body["userId"].to_i
    password = body["newPassword"].to_s
    if user_id <= 0 || password.length < 8
      return Utils.error(res, 400, "userId o newPassword invalido")
    end

    @db.reset_password(user_id, password)
    Utils.json(res, 200, { ok: true })
  end

  def admin_export_csv(_req, res, user)
    return unless admin_only(res, user)

    districts = @db.list_districts
    csv = CSV.generate do |out|
      out << ["Region", "Distrito", "Pastor", "Celular", "Email", "Estado", "Avance (%)", "Completados", "Faltantes", *DEPARTMENTS]
      districts.each do |d|
        missing = DEPARTMENTS.reject { |dept| d[:reports][dept] }
        out << [
          d[:region],
          d[:districtName],
          d[:pastorName],
          d[:phone],
          d[:email],
          d[:status],
          d[:percentage],
          "#{d[:completed]}/#{d[:total]}",
          missing.join(" | "),
          *DEPARTMENTS.map { |dept| d[:reports][dept] ? "SI" : "NO" }
        ]
      end
    end

    res.status = 200
    res["Content-Type"] = "text/csv; charset=utf-8"
    res["Content-Disposition"] = "attachment; filename=consolidado_mpn_#{Time.now.utc.strftime('%Y-%m-%d')}.csv"
    res.body = csv
  end
end

class AppServer
  def initialize
    FileUtils.mkdir_p(File.dirname(APP_DB_PATH))
    @db = AppDB.new(APP_DB_PATH)
    @db.migrate!
    @db.seed!(DIRECTORY_PATH)
  end

  def start
    server = WEBrick::HTTPServer.new(
      Port: APP_PORT,
      BindAddress: APP_BIND,
      DocumentRoot: PUBLIC_DIR,
      AccessLog: [],
      Logger: WEBrick::Log.new($stdout, WEBrick::Log::INFO)
    )

    server.mount("/api", ApiServlet, @db)
    trap("INT") { server.shutdown }

    puts "Servidor iniciado en http://#{APP_BIND}:#{APP_PORT}"
    puts "Admin: #{DEFAULT_ADMIN_USERNAME} / #{DEFAULT_ADMIN_PASSWORD}"
    puts "Pastores: usuario por distrito, password inicial #{DEFAULT_PASTOR_PASSWORD}"
    server.start
  end
end

if __FILE__ == $PROGRAM_NAME
  AppServer.new.start
end
