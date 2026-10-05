# TableroKanban

## Analisis estatico con SonarQube

El proyecto incluye SonarQube y SonarScanner en Docker Compose. Para iniciar
SonarQube:

```powershell
docker compose up -d sonarqube
```

Abre `http://localhost:9000`, inicia sesion con `admin` / `admin` y crea un
token en **My Account > Security**. Ejecuta el analisis pasando el token:

```powershell
$env:SONAR_TOKEN = "TU_TOKEN"
docker compose --profile analysis run --rm sonar-scanner
```

El resultado se consulta en `http://localhost:9000` en el proyecto
`tablero-kanban`. Para detener SonarQube:

```powershell
docker compose down
```

Los datos de SonarQube se conservan en volumenes Docker. Para eliminarlos
tambien, usa `docker compose down -v`.