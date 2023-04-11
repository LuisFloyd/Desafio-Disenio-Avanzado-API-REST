const express = require('express')
const { mostrarInventario, prepararHATEOAS, obtenerJoyasPorFiltros, reporteConsulta, datosJoya } = require('./consultas')
const app = express()

app.listen(3000, () => console.log("¡Servidor encendido!"))

app.use(express.json())

app.get("/joyas", reporteConsulta, async (req, res) => {
    try {
        const queryStrings = req.query
        const inventario = await mostrarInventario(queryStrings)
    //    res.json(inventario)
        const HATEOAS = await prepararHATEOAS(inventario)
        res.json(HATEOAS);
    } catch (error) {
        console.log(error)
        res.status(500).send(`error al ejecutar "mostrarInventario"`)        
    }
})

app.get("/joyas/joya/:id", reporteConsulta, async (req, res) => {
    try {
        const {id} = req.params
        const joya = await datosJoya(id)
        res.json(joya)
    } catch (error) {
        console.log(error)
        res.status(500).send(`error al ejecutar "datosJoya"`)        
    }
})

app.get("/joyas/filtros", reporteConsulta, async (req, res) => {
    try {
        const queryStrings = req.query
        const joyas = await obtenerJoyasPorFiltros(queryStrings)
        res.json(joyas)          
    } catch (error) {
        console.log(error)
        res.status(500).send(`error al ejecutar "obtenerJoyasPorFiltros"`)
    }
})

app.get("*", (req, res) => {
    res.status(404).send("Esta ruta no existe")
})
