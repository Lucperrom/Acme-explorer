Acme Explorer - Countdown Watchlist Feature

Se ha implementado una nueva funcionalidad para la Watchlist de Acme Explorer, basada en los requerisitos. A continuación, se detallan las decisiones tomadas y las características implementadas:

1. **Descripción de la funcionalidad**:
   - Para añadir un viaje a la wathclist se ha puesto un botón en la página de detalles del viaje.
   - La Watchlist permite a los exploradores (y otros usuarios) seleccionar viajes para rastrear y ver un temporizador de cuenta regresiva en una página dedicada, accesible desde el menú principal.
   - Los viajes que comienzan en menos de una semana se resaltan en amarillo (el card) para mayor visibilidad.
   - Los usuarios pueden eliminar viajes de la Watchlist (dejar de rastrearlos).
   - También se muestran los viajes no disponibles (por ejemplo, si un ticker ya no existe). Estos se pueden eliminar manualmente desde la Watchlist.

2. **Decisiones tomadas**:
   - La funcionalidad se ha creado de forma muy similar a la lista de viajes guardados, pero es más simple porque no tiene múltiples listas.
   - Se ha decidido que la Watchlist esté disponible para todos los usuarios, incluidos los anónimos. Sin embargo, al cambiar de usuario, los datos de la Watchlist se borran del `localStorage`.
   - No se permite guardar un viaje en la Watchlist si ya existe en ella.
   - No se ha internacionalizado esta funcionalidad por simplicidad.

3. **Pruebas**:
   - Se puede probar con las siguientes credenciales:
     - **Usuario**: explorer@explorer.com
     - **Contraseña**: explorer
   - Para probar los viajes no disponibles, se puede editar manualmente el `localStorage` y añadir un ticker inexistente, como `"ticker-inexistente"`, en la lista de tickers.

4. **Limitaciones**:
   - La funcionalidad no incluye soporte para múltiples listas.
   - No se ha implementado la internacionalización de los textos.

