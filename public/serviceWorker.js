'use strict'

self.addEventListener('push', function (event) {
    const data = JSON.parse(event.data.text())
    // If there is not an icon, use the default icon
    if (!data.icon) {
        data.icon = '/favico.ico'
    }
    event.waitUntil(
        registration.showNotification(data.title, data)
    )
})

self.addEventListener('notificationclick', function (event) {
    event.notification.close()
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            if (clientList.length > 0) {
                let client = clientList[0]
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i]
                    }
                }
                return client.focus()
            }
            return clients.openWindow('/')
        })
    )
})
