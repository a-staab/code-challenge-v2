import React, { useEffect, useState, useCallback } from "react"
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"

import "leaflet/dist/leaflet.css"

import RAW_COMMUNITY_AREAS from "../../../data/raw/community-areas.geojson"

function YearSelect({ setFilterVal }) {
  // Filter by the permit issue year for each restaurant
  const startYear = 2026
  const years = [...Array(11).keys()].map((increment) => {
    return startYear - increment
  })
  const options = years.map((year) => {
    return (
      <option value={year} key={year}>
        {year}
      </option>
    )
  })

  return (
    <>
      <label htmlFor="yearSelect" className="fs-3">
        Filter by year:{" "}
      </label>
      <select
        id="yearSelect"
        className="form-select form-select-lg mb-3"
        onChange={(e) => setFilterVal(e.target.value)}
      >
        {options}
      </select>
    </>
  )
}

export default function RestaurantPermitMap() {
  const communityAreaColors = ["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"]

  const [currentYearData, setCurrentYearData] = useState([])
  const [year, setYear] = useState(2026)

  const yearlyDataEndpoint = `/map-data/?year=${year}`

  useEffect(() => {
    
    fetch(yearlyDataEndpoint)
      .then((res) => res.json())
      .then((data) => {
        /**
         * TODO: Fetch the data needed to supply to map with data
         */
        setCurrentYearData(data);
      })
  }, [yearlyDataEndpoint])


  function getColor(percentageOfPermits) {
    // Dynamic breaks from current data
    const percents = currentYearData.map(d => d.num_permits / totalPermits * 
      100).sort((a,b)=>a-b);
    const q1 = percents[Math.floor(percents.length * 0.25)];
    const q2 = percents[Math.floor(percents.length * 0.50)];
    const q3 = percents[Math.floor(percents.length * 0.75)];
    if (percentageOfPermits >= q3) return communityAreaColors[3];
    if (percentageOfPermits >= q2) return communityAreaColors[2];
    if (percentageOfPermits >= q1) return communityAreaColors[1];
    return communityAreaColors[0];
  }

  const setAreaInteraction =
    /**
     * TODO: Use the methods below to:
     * 1) Shade each community area according to what percentage of 
     * permits were issued there in the selected year
     * 2) On hover, display a popup with the community area's raw 
     * permit count for the year
     */
    useCallback((feature, layer) => {
      const name = feature.properties.community;
      const communityAreaData = currentYearData.find(d => d.name === name);
      const countPermits = communityAreaData?.num_permits || 0;
      const percentageOfPermits = totalPermits > 0 ? countPermits/totalPermits * 100 : 0;
      console.log(percentageOfPermits)
      layer.setStyle({ fillOpacity: 0.9, fillColor: getColor(percentageOfPermits) })
      layer.on('mouseover', () => {
          layer.bindPopup(`${feature.properties.community}: ${communityAreaData.num_permits} permits`)
          layer.openPopup()
        })
    ;} ,[currentYearData]);
  
  function getTotalandMaxNumPermits(currentYearData) {
    // This could be two functions instead of one, and that would be nicer from a test/maintenance perspective, 
    // but it will be more performant to compute both results together.
    let totalPermits = 0;
    // Maximum number of permits held by a single community area in current year data
    let maxNumPermits = 0
    for (const community_area of currentYearData) {
      totalPermits += community_area.num_permits
      if (community_area.num_permits > maxNumPermits) {
        maxNumPermits = community_area.num_permits
      }
    }
    return { totalPermits, maxNumPermits };
  }

  const computedTotals = getTotalandMaxNumPermits(currentYearData);
  const totalPermits = computedTotals.totalPermits;
  const maxNumPermits = computedTotals.maxNumPermits;

  return (
    <>
      <YearSelect filterVal={year} setFilterVal={setYear} />
      <p className="fs-4">
        Restaurant permits issued this year: {totalPermits}
      </p>
      <p className="fs-4">
        Maximum number of restaurant permits in a single area:
        {maxNumPermits}
      </p>
      <MapContainer
        id="restaurant-map"
        center={[41.88, -87.62]}
        zoom={10}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"
        />
        {currentYearData.length > 0 ? (
          <GeoJSON
            data={RAW_COMMUNITY_AREAS}
            onEachFeature={setAreaInteraction}
            key={year}
          />
        ) : null}
      </MapContainer>
    </>
  )
}
