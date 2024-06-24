async function request(url, config={}) {
  const r = await fetch(url, config)
  const json = await r.json()
  return json
}

export function createService(url) {
  async function getAll() {
    return await request(url)
  }
  
  async function getById(id) {
    return await request(url+'/'+id)
  }
  
  async function post(data) {
    return await request(url, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  }
  
  async function put(id, data) {
    return await request(url+'/'+id, {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  }
  
  async function del(id) {
    return await request(url+'/'+id)
  }

  return {
    getAll,
    getById,
    post,
    put,
    del
  }
}

export function sendOfflineDataToServer(storageKey, service) {
  const offlineItems = JSON.parse(localStorage.getItem(storageKey)) || [];
  offlineItems.forEach(item => {
    service.post(item)
  });
  localStorage.removeItem(storageKey);
}