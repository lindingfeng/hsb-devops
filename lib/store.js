const stores = {}

const getData = (key) => {
  return stores[key]
}

const setData = (key, data) => {
  stores[key] = data
}

module.exports = {
  stores,
  setData,
  getData
}