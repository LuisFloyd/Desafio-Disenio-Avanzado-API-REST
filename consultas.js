const { Pool } = require('pg')
const format = require('pg-format')

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'pgadmin2020',
    database: 'joyas',
    port: 5432,
    allowExitOnIdle: true
})

const mostrarInventario = async ({limits = 10, page = 1, order_by = 'id_ASC'}) => {
    const offset = (page - 1)  * limits
    const [campo, orden] = order_by.split('_')
    const consulta = format('Select * from inventario order by %s %s limit %s offset %s', campo, orden, limits, offset)
    const { rows : joyas } = await pool.query(consulta)
    return joyas
}

const prepararHATEOAS = (joyas) => {
    let stockTotal = 0
    const results = joyas.map((m) => {
        stockTotal += m.stock
        return {
            name: m.nombre,
            href: `/joyas/joya/${m.id}`,
        }
    })
    const totalJoyas = joyas.length

    const HATEOAS = {
        totalJoyas,
        stockTotal,
        results
    }
    return HATEOAS
}

const datosJoya = async (id) => {
    const consulta = format('Select * from inventario where id = %s', [id])
    const { rows : joyas } = await pool.query(consulta)
    return joyas
}

const obtenerJoyasPorFiltros = async ({precio_min, precio_max, categoria, metal}) => {
    let filtros = []
    let values = []

    const agregarFiltro = (campo, comparador, valor) => {
        values.push(valor)
        const {length} = filtros
        filtros.push(`${campo} ${comparador} $${length+1}`)
    }

    if (precio_min) agregarFiltro('precio', '>=', precio_min)
    if (precio_max) agregarFiltro('precio', '<=', precio_max)
    if (categoria) agregarFiltro('categoria', '=', `${categoria}`)
    if (metal) agregarFiltro('metal', '=', `${metal}`)

    let consulta = "Select * from inventario"
    if (filtros.length > 0) {
        filtros = filtros.join(" AND ")
        consulta += ` WHERE ${filtros}`
    }
    const { rows: joyas } = await pool.query(consulta, values)
    return joyas    
}

const reporteConsulta = async (req, res, next) => {
    const parametros = req.params
    const query = req.query
    const url = req.url
    console.log(`
        Hoy ${new Date()}
        Se ha recibido una consulta en la ruta ${url}
        con los parámetros:
        `, {parametros} , {query})
    next()
}

module.exports = { mostrarInventario, prepararHATEOAS, obtenerJoyasPorFiltros, reporteConsulta, datosJoya }