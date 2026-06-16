# Historia de Usuario Refinada: Alta de nuevo producto en catálogo

## Historia original (a refinar)
> **Como** responsable de almacén  
> **Quiero** poder realizar el registro de productos al inventario  
> **Para** mantener un stock saludable

## Historia refinada
**Como** administrador del sistema de inventario (jefe de almacén o usuario con privilegios)  
**Quiero** registrar un nuevo producto en el catálogo especificando sus atributos clave para almacenamiento  
**Para** que los operadores puedan recibir, ubicar y surtir ese producto correctamente desde el primer día.

## Criterios de aceptación (Dado / Cuando / Entonces)

### CA-1: Registro mínimo exitoso
**Dado** que el administrador accede al módulo “Productos” y presiona “Nuevo producto”  
**Cuando** ingresa los siguientes datos obligatorios:
- Código SKU (único, alfanumérico, obligatorio)
- Nombre / descripción (obligatorio)
- Unidad de medida (ej. pieza, kg, litro, caja)
- Categoría (ej. materia prima, producto terminado, refacción)

**Entonces** el sistema guarda el producto, asigna un ID interno automático y lo muestra en la lista de productos activos.

### CA-2: Validación de unicidad de SKU
**Dado** que ya existe un producto con el SKU `ABC-123`  
**Cuando** el administrador intenta crear otro producto con el mismo SKU `ABC-123`  
**Entonces** el sistema muestra el mensaje de error “El SKU ya existe. Use un código diferente” y no permite guardar.

### CA-3: Atributos opcionales para almacenamiento (mejora de operación)
**Dado** que el administrador está creando un producto  
**Cuando** opcionalmente ingresa uno o más de los siguientes datos:
- Peso (kg)
- Volumen (m³)
- Dimensiones (largo, ancho, alto en cm)
- Requerimiento de temperatura (seco, refrigerado, congelado)

**Entonces** el sistema almacena esos atributos en la ficha del producto para usarlos en sugerencias de ubicación y planificación de espacio.

### CA-4: Advertencia por nombre o descripción similar
**Dado** que ya existe un producto con nombre “Batería 12V”  
**Cuando** el administrador ingresa un nuevo producto con nombre “Batería 12V - nuevo modelo” y presiona guardar  
**Entonces** el sistema muestra una advertencia no bloqueante: “¿Producto similar encontrado? Revise si ya existe antes de continuar”. El usuario puede confirmar o cancelar.

### CA-5: Trazabilidad de creación (auditoría)
**Dado** que el administrador completa y guarda un nuevo producto  
**Entonces** el sistema registra automáticamente sin intervención del usuario:
- Usuario que creó el registro
- Fecha y hora de creación

Estos datos no son modificables posteriormente.

## Dependencias (requiere que exista previamente)
- Catálogo maestro de **unidades de medida** (creado con datos básicos: pieza, kg, litro, caja, pallet, etc.)
- (Opcional) Catálogo de **categorías** (si se usa lista desplegable; de lo contrario puede ser texto libre en primera versión)

## Restricciones no funcionales (para definición de listo)
- El tiempo de respuesta al guardar un producto debe ser **menor a 1 segundo** en condiciones normales.
- El sistema debe prevenir SKU duplicados a nivel de base de datos (restricción `UNIQUE`), incluso si dos administradores crean productos simultáneamente.
- La interfaz debe ser usable en una computadora de escritorio (primera versión), sin necesidad de hardware especial.

## Preguntas pendientes para el siguiente refinamiento
1. ¿Se permitirá **editar** un producto después de creado? Si sí, ¿qué campos sí/no? (recomendación: no permitir editar SKU).
2. ¿Se requiere asignar un **código de barras** en el alta o se genera después automáticamente?
3. ¿Cómo se manejan las **bajas** de producto? (campo `activo` = falso, sin borrado físico).
4. ¿Cuántos atributos opcionales son indispensables para el primer sprint? (Ajustar según complejidad del almacén).

## Definición de listo (DoD) para esta historia
- [ ] Probada en entorno de pruebas con al menos **3 productos reales** del almacén.
- [ ] Los datos persisten correctamente en la base de datos (tabla `productos`).
- [ ] La interfaz muestra mensajes de error claros y no técnicos (ej. “El SKU ya existe”).
- [ ] El administrador puede buscar y visualizar el nuevo producto en la lista de productos.
- [ ] La historia ha sido estimada por el equipo (ej. 3 puntos / 1 día ideal).
- [ ] No quedan dependencias bloqueantes con otras historias no iniciadas.

