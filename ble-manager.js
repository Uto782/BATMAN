// BLE Manager - Handles Bluetooth Low Energy connections and communication

class BLEManager {
    constructor() {
        this.device = null;
        this.server = null;
        this.service = null;
        this.txCharacteristic = null; // For sending patterns
        this.rxCharacteristic = null; // For receiving tap events
        this.isConnected = false;
        this.onConnectionChange = null;
        this.onTapReceived = null;

        // BLE Service and Characteristic UUIDs
        // These should match your device's configuration
        this.SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';
        this.TX_CHARACTERISTIC_UUID = '12345678-1234-5678-1234-56789abcdef1'; // Write to device
        this.RX_CHARACTERISTIC_UUID = '12345678-1234-5678-1234-56789abcdef2'; // Notify from device
    }

    // Check if Web Bluetooth is supported
    isSupported() {
        if (!navigator.bluetooth) {
            console.error('Web Bluetooth API is not supported in this browser.');
            return false;
        }
        return true;
    }

    // Scan and connect to a BLE device
    async connect() {
        if (!this.isSupported()) {
            throw new Error('Web Bluetooth is not supported');
        }

        try {
            console.log('Requesting Bluetooth Device...');

            // Request device with optional filters
            this.device = await navigator.bluetooth.requestDevice({
                // acceptAllDevices: true, // Use this for testing
                filters: [
                    { services: [this.SERVICE_UUID] }
                ],
                optionalServices: [this.SERVICE_UUID]
            });

            console.log('Device selected:', this.device.name);

            // Listen for disconnection
            this.device.addEventListener('gattserverdisconnected', () => {
                this.handleDisconnection();
            });

            // Connect to GATT server
            console.log('Connecting to GATT Server...');
            this.server = await this.device.gatt.connect();

            // Get service
            console.log('Getting Service...');
            this.service = await this.server.getPrimaryService(this.SERVICE_UUID);

            // Get characteristics
            console.log('Getting Characteristics...');
            this.txCharacteristic = await this.service.getCharacteristic(this.TX_CHARACTERISTIC_UUID);
            this.rxCharacteristic = await this.service.getCharacteristic(this.RX_CHARACTERISTIC_UUID);

            // Start notifications for tap events
            await this.rxCharacteristic.startNotifications();
            this.rxCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
                this.handleNotification(event);
            });

            this.isConnected = true;
            console.log('Connected successfully!');

            if (this.onConnectionChange) {
                this.onConnectionChange(true, this.device.name);
            }

            return {
                success: true,
                deviceName: this.device.name
            };

        } catch (error) {
            console.error('Connection failed:', error);
            this.isConnected = false;

            if (this.onConnectionChange) {
                this.onConnectionChange(false, null);
            }

            throw error;
        }
    }

    // Disconnect from device
    async disconnect() {
        if (this.device && this.device.gatt.connected) {
            await this.device.gatt.disconnect();
            console.log('Disconnected from device');
        }

        this.handleDisconnection();
    }

    // Handle disconnection event
    handleDisconnection() {
        this.isConnected = false;
        this.server = null;
        this.service = null;
        this.txCharacteristic = null;
        this.rxCharacteristic = null;

        console.log('Device disconnected');

        if (this.onConnectionChange) {
            this.onConnectionChange(false, null);
        }
    }

    // Send pattern to device
    async sendPattern(patternId) {
        if (!this.isConnected || !this.txCharacteristic) {
            throw new Error('Device not connected');
        }

        try {
            // Send pattern ID as a single byte
            const data = new Uint8Array([patternId]);
            await this.txCharacteristic.writeValue(data);

            console.log(`Sent pattern ${patternId} to device`);
            return true;

        } catch (error) {
            console.error('Failed to send pattern:', error);
            throw error;
        }
    }

    // Handle incoming notifications (tap events)
    handleNotification(event) {
        const value = event.target.value;
        const data = new Uint8Array(value.buffer);

        console.log('Received notification:', data);

        // Assuming tap event is indicated by a specific byte value
        // Adjust this based on your device's protocol
        if (data[0] === 1) { // Example: 1 = tap event
            if (this.onTapReceived) {
                this.onTapReceived();
            }
        }
    }

    // Reconnect to previously connected device
    async reconnect() {
        if (!this.device) {
            throw new Error('No device to reconnect to');
        }

        try {
            console.log('Reconnecting...');
            this.server = await this.device.gatt.connect();
            this.service = await this.server.getPrimaryService(this.SERVICE_UUID);
            this.txCharacteristic = await this.service.getCharacteristic(this.TX_CHARACTERISTIC_UUID);
            this.rxCharacteristic = await this.service.getCharacteristic(this.RX_CHARACTERISTIC_UUID);

            await this.rxCharacteristic.startNotifications();
            this.rxCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
                this.handleNotification(event);
            });

            this.isConnected = true;
            console.log('Reconnected successfully!');

            if (this.onConnectionChange) {
                this.onConnectionChange(true, this.device.name);
            }

            return true;

        } catch (error) {
            console.error('Reconnection failed:', error);
            throw error;
        }
    }

    // Get connection status
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            deviceName: this.device ? this.device.name : null
        };
    }
}

// Export for use in other scripts
const bleManager = new BLEManager();
