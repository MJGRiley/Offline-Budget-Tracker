let database;
const request = indexedDB.open("offline", 1)

request.onupgradeneeded = (e) => {
    let db = e.target.result;
    db.createObjectStore("pending",{ 
        autoIncrement: true
    })
}

request.onsuccess = (e) => {
    database = e.target.result;
    if (navigator.onLine) {addToDatabase()}
}

request.onerror = (e) => {
    console.log("error: " + e.target.errorCode)
}

function saveRecord(trans){
    const transaction = database.transaction(["pending"],"readwrite")
    const store =  transaction.objectStore("pending")
    store.add(trans)
}

function addToDatabase(store){
    const transaction = database.transaction(["pending"],"readwrite")
    const store =  transaction.objectStore("pending")
    let getAllTransactions = store.getAll()
    getAllTransactions.onsuccess = function () {
        if (getAllTransactions.results.length > 0) {
            fetch ("/api/transaction/bulk",{
                method: "POST",
                body: JSON.stringify(getAllTransactions.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                  }
            })
            .then(res => {
                return res.json()
            })
            .then(data => {
                const transaction = database.transaction(["pending"],"readwrite")
                const store =  transaction.objectStore("pending")
                store.clear()
            })
        }
    }
}

window.addEventListener("online", addToDatabase)