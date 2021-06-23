module.exports = class LiteSocket { 
    // Зраним подключение
    ws;

    // Храним события
    events = [];
    
    // Настройки подключения
    config = { 
        host: 'ws://127.0.0.1:3110',
        debug: false,
        protocol: [],
        reconnect: { 
            time: 2,
            limit: 10
        }
    };

    // Счетчик подключений
    counter = 1;

    constructor(config = null) { 

        // Добавляем пользовательские конфигурации
        if (config) 
            Object.assign(this.config, config);

        this.connect();
    }

    /**
     * Подключаемся к сокету
     * 
     * @param {*} host 
     */
    connect() { 
    
        try {
            this.ws = new WebSocket(this.config.host, this.config.protocol);
        } catch { 
            console.log('[error] Connect failed.');
        }

        // Ожидаем ответ
        this.ws.onmessage = (data) => this.message(data);
        
        this.ws.onopen = () => { 
            if (this.config.debug)
                console.log('WebSocket open...');

            this.counter = 1;
        }

        // Отладка при ошибке
        if (this.config.debug)
            this.ws.onerror = error => console.log(`[error] Type: ${error.type}`);

        // Если сойдинение закрылось
        this.ws.onclose = (event) => this.close(event); 
    }

    /**
     * Ожидаем ответ сервера
     * 
     * @param {*} result 
     */
    message(result) { 
        let data = JSON.parse(result.data);
        this.trigger(data.event, data.data);
    }

    /**
     * Закрываем сойдинение
     * 
     * @param {*} event 
     */
    close(event) { 
    
        // Отладка при разрыве сойдинения
        if (this.config.debug) { 
            console.log(`[Close] Connect close. \r\nCode: ${event.code} \r\nType: ${event.type};`); 
            console.log('Reconnect...'); 
        }
      
        /**
         * Если по какой-то причине сойдинение было разорвано,
         * то пытаемся подключиться снова
         */
        if(this.counter < this.config.reconnect.limit) 
            setTimeout(() => this.connect(), (this.config.reconnect.time*1000));
        
        this.counter++;
    }

    /**
     * Вызываем событие на сервере
     * 
     * @param {*} event 
     * @param {*} data 
     */
    emit(event, data = []) { 
        let json = JSON.stringify({"event": event, "data": data});

        this.ws.send(json);
    }

    /**
     * Создаем событие
     * 
     * @param {*} event 
     * @param {*} funcion 
     */
    on(event, funcion) { 
        this.events[event] = funcion;
    }
    
    /**
     * Выполняем события
     * 
     * @param {*} event 
     * @param {*} data 
     */
     trigger(event, data) {
         if (event in this.events)
            this.events[event](data);
    }

    /**
     * Вещание
     * 
     * @param {*} data 
     */
    send(data) {
        this.ws.send(data);
    }
}
