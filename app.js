const express = require('express')
const path = require('path')
const dbPath = path.join(__dirname, 'covid19India.db')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const initializationDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`Server Error ${e.message}`)
    process.exit(1)
  }
}
initializationDatabase()
app.get('/states/', async (request, response) => {
  const query = `SELECT * FROM state;`
  const stateDetails = await db.all(query)
  const data = stateDetails.map(eachObject => {
    return {
      stateId: eachObject.state_id,
      stateName: eachObject.state_name,
      population: eachObject.population,
    }
  })
  response.send(data)
})
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const query = `SELECT * FROM state WHERE state_id = ${stateId};`
  const dataOfState = await db.get(query)
  const data = {
    stateId: dataOfState.state_id,
    stateName: dataOfState.state_name,
    population: dataOfState.population,
  }
  response.send(data)
})
app.post('/districts/', async (request, response) => {
  const detailsOfDistrict = request.body
  const {districtName, stateId, cases, cured, active, deaths} =
    detailsOfDistrict
  const query = `INSERT INTO district(district_name,state_id,cases,cured,active,deaths)
  VALUES('${districtName}',${stateId},${cases},${cured},${active},${deaths});`
  await db.run(query)
  response.send('District Successfully Added')
})
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const query = `SELECT * FROM district WHERE district_id =${districtId};`
  const dataOfDistrict = await db.get(query)
  const data = {
    districtId: dataOfDistrict.district_id,
    districtName: dataOfDistrict.district_name,
    stateId: dataOfDistrict.state_id,
    cases: dataOfDistrict.cases,
    cured: dataOfDistrict.cured,
    active: dataOfDistrict.active,
    deaths: dataOfDistrict.deaths,
  }
  response.send(data)
})
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const query = `DELETE FROM district WHERE district_id = ${districtId};`
  await db.run(query)
  response.send('District Removed')
})
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const updateDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = updateDetails
  const query = `UPDATE district SET 
      district_name ='${districtName}',
      state_id =${stateId},
      cases = ${cases},
      cured = ${cured},
      active = ${active},
      deaths = ${deaths}
      WHERE district_id =${districtId};`
  await db.run(query)
  response.send('District Details Updated')
})
app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const query = `SELECT * FROM district;`
  const detailsOfResult = await db.get(query)
  
  response.send(detailsOfResult);
})
app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const query = `SELECT * FROM district INNER JOIN state WHERE district_id =${districtId};`
  const districtName = await db.get(query)
  const data = {
    stateName: districtName.state_name,
  }
  response.send(data)
})
module.exports = app
