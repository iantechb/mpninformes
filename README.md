# MPN - Plataforma Multiusuario de Informes

Aplicacion web multiusuario con:
- Login por pastor.
- Panel de administracion.
- Seguimiento por 56 distritos.
- Consolidado y exportacion CSV.

## Arquitectura
- Backend: `server.rb` (Ruby + WEBrick + SQLite).
- Frontend: `public/index.html`, `public/app.js`, `public/styles.css`.
- Datos base: `data/district_directory.json`.
- Base de datos: `db/app.sqlite3`.

## Ejecucion local
1. En la carpeta del proyecto:
   ```bash
   ruby server.rb
   ```
2. Abrir [http://localhost:4567](http://localhost:4567)

## Credenciales iniciales
- Admin:
  - Usuario: `admin`
  - Contrasena: `AdminMPN2026!`
- Pastores:
  - Usuario: se genera por distrito (ejemplo: `bagua-a-1`)
  - Contrasena inicial: `PastorMPN2026!`

## Variables de entorno
Usa `.env.example` como referencia:
- `APP_BIND` (default `127.0.0.1`)
- `APP_PORT` (default `4567`)
- `PORT` (usado por Render)
- `DB_PATH` (ruta del SQLite)
- `SESSION_SECRET` (obligatorio cambiar en produccion)
- `DEFAULT_ADMIN_USERNAME`
- `DEFAULT_ADMIN_PASSWORD`
- `DEFAULT_PASTOR_PASSWORD`

## Despliegue sin VPS (Render recomendado)
Este proyecto ya incluye `render.yaml` para crear el servicio automaticamente.

1. Subir este proyecto a GitHub.
2. En Render:
   - `New` -> `Blueprint`
   - Conectar el repo
   - Confirmar despliegue con `render.yaml`
3. En variables de entorno de Render, define:
   - `DEFAULT_ADMIN_PASSWORD`
   - `DEFAULT_PASTOR_PASSWORD`
4. Render creara:
   - Servicio web Ruby
   - Disco persistente en `/var/data`
   - `DB_PATH=/var/data/app.sqlite3`
5. Al finalizar, abre la URL publica que Render te entrega.

Notas:
- Plan gratuito de Render puede “dormir” por inactividad.
- Tus datos quedan persistentes en el disco montado (`/var/data`), no se pierden en redeploy.

## Despliegue en linea (Ubuntu + Nginx + HTTPS)
Suposiciones:
- Dominio: `mpn.tudominio.org`
- Ruta app: `/opt/mpn-app`
- Usuario servicio: `www-data`

1. Instalar paquetes:
   ```bash
   sudo apt update
   sudo apt install -y ruby-full ruby-sqlite3 sqlite3 nginx certbot python3-certbot-nginx
   ```

2. Copiar proyecto al servidor en `/opt/mpn-app`.

3. Configurar servicio systemd:
   ```bash
   sudo cp /opt/mpn-app/deploy/systemd/mpn.service /etc/systemd/system/mpn.service
   sudo nano /etc/systemd/system/mpn.service
   ```
   Cambia:
   - `SESSION_SECRET`
   - `DEFAULT_ADMIN_PASSWORD`
   - `DEFAULT_PASTOR_PASSWORD`

4. Iniciar servicio:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable mpn
   sudo systemctl start mpn
   sudo systemctl status mpn --no-pager
   ```

5. Configurar Nginx:
   ```bash
   sudo cp /opt/mpn-app/deploy/nginx/mpn.conf /etc/nginx/sites-available/mpn.conf
   sudo nano /etc/nginx/sites-available/mpn.conf
   ```
   Ajusta `server_name mpn.tudominio.org;`

   Luego:
   ```bash
   sudo ln -s /etc/nginx/sites-available/mpn.conf /etc/nginx/sites-enabled/mpn.conf
   sudo nginx -t
   sudo systemctl reload nginx
   ```

6. Habilitar HTTPS (Let’s Encrypt):
   ```bash
   sudo certbot --nginx -d mpn.tudominio.org
   ```

7. Verificar:
   - Abrir `https://mpn.tudominio.org`
   - Revisar logs:
     ```bash
     sudo journalctl -u mpn -f
     ```

## Endpoints principales
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`
- `GET /api/departments`
- `GET /api/regions`
- `GET /api/summary`
- `GET /api/districts`
- `PUT /api/districts/:id/reports`
- `GET /api/admin/users`
- `POST /api/admin/reset-password`
- `GET /api/admin/export.csv`
