
# CardList (Toolbox Quasar component)

Componente para listar items del tipo clave valor en una tarjeta (card) diferenciados por un separador.


## Installation

Instalar fwk-q-cardlist con npm

```bash
  npm install fwk-q-cardlist
```

## Usage/Examples

Se debe definir un objeto donde las keys hacen referencia a los títulos y los values a la descripción de las mismas.
Los values pueden llevar tanto strings como hacer referencia a variables de la app.

```javascript
<template>
    <q-page>
        <CardList :objectToMap="cardListTemplate" />
    </q-page>
</template>

import CardList from 'fwk-q-cardlist'

```
#### Demo template (Object):
```javascript
const cardListTemplate = {
    'Número de OT': 'ot',
    'Tipo de OT': 'tipoOt',
    'Dirección ': 'domicilio',
    'Fecha y hora': 'agendaOt',
    'Parque instalado': 'SI'
}
```
## Props

#### Split:
Muestra key y value una linea debajo de la otra.
```javascript
<CardList
    split    // 👈 SPLIT ON!
    v-for="(ot, key) in ots"
    :key="ot"
    :objectToMap="ots[key]"
    @click="otSelected(key)"/>

```
#### defValue:
Por defecto NO muestra campos con values UNDEFINED
Si posee algun valor muestra dicho string cuando el value es UNDEFINED
```javascript
<CardList
    defValue='N/A'    // 👈 default value = 'N/A' cuando los value son UNDEFINED
    v-for="(ot, key) in ots"
    :key="ot"
    :objectToMap="ots[key]"
    @click="otSelected(key)"/>

```
## Screenshots
### Split OFF

![App Screenshot](https://iili.io/6VptDJ.jpg)


### Split ON

![App Screenshot](https://iili.io/iwdUiB.jpg)
## Authors

- [@tecoArg](https://www.telecom.com.ar)

