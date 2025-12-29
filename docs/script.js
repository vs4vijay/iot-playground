// ===================================
// IoT Playground - Interactive Features
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    initFirmwareFlasher();
    initScrollAnimations();
    initSmoothScroll();
    parseURLParameters();
});

// ===================================
// Firmware Flasher Feature
// ===================================

// Global state
let state = {
    connected: false,
    port: null,
    device: null,
    isFlashing: false,
    firmwareUrl: null,
    selectedProject: null,
    selectedVersion: null
};

// Project definitions with versions
// NOTE: Firmware URLs point to official releases in this repository
// Users can also enter custom firmware URLs via the input field
// 
// PRODUCTION RECOMMENDATION: Load this data dynamically from:
// - A JSON configuration file (e.g., projects-config.json)
// - An API endpoint that can be updated without code deployment
// - A CMS or database for easier content management
const projectData = {
    esp32: {
        name: 'ESP32 Generic',
        chipFamily: 'ESP32',
        versions: [
            { id: 'v2.0.14', name: 'v2.0.14 (Stable)', date: '2023-11-20', description: 'Latest stable release' },
            { id: 'v2.0.13', name: 'v2.0.13 (Stable)', date: '2023-10-15', description: 'Previous stable release' },
            { id: 'v3.0.0-beta', name: 'v3.0.0-beta', date: '2024-01-10', description: 'Beta release with new features' }
        ]
    },
    esp8266: {
        name: 'ESP8266 Generic',
        chipFamily: 'ESP8266',
        versions: [
            { id: 'v3.1.2', name: 'v3.1.2 (Stable)', date: '2023-12-01', description: 'Latest stable release' },
            { id: 'v3.1.1', name: 'v3.1.1 (Stable)', date: '2023-10-20', description: 'Previous stable release' }
        ]
    },
    m5cardputer: {
        name: 'M5Stack Cardputer',
        chipFamily: 'ESP32-S3',
        versions: [
            // NOTE: This URL points to a release in this repository for demonstration
            // In production, firmware URLs should point to:
            // - Official manufacturer firmware repositories (e.g., M5Stack official releases)
            // - Verified and trusted sources only
            // - Consider implementing firmware signing and verification
            { id: '6f63e83', name: 'UserDemo (6f63e83)', date: '2024-01-15', description: 'Official M5Stack user demo', url: 'https://github.com/vs4vijay/iot-playground/releases/download/6f63e83/UserDemo-6f63e83.M5Cardputer.bin' },
            { id: 'm5cardremote', name: 'M5Card Remote', date: '2024-01-10', description: 'IR remote control app' },
            { id: 'gameboy', name: 'GameBoy Emulator', date: '2024-01-05', description: 'Full GameBoy emulator' }
        ]
    },
    m5stickc: {
        name: 'M5StickC Plus2',
        chipFamily: 'ESP32-S3',
        versions: [
            { id: 'userdemo', name: 'UserDemo', date: '2024-01-12', description: 'Official M5StickC user demo' },
            { id: 'onebutton', name: 'OneButton Demo', date: '2024-01-08', description: 'Button interaction demo' },
            { id: 'evilclock', name: 'Evil Clock', date: '2024-01-03', description: 'WiFi security tool' }
        ]
    },
    'rpi-pico': {
        name: 'Raspberry Pi Pico',
        chipFamily: 'RP2040',
        versions: [
            // NOTE: MicroPython URLs - verify these point to official sources
            // Production recommendation: Use official MicroPython download URLs
            // and keep them updated with latest releases
            { id: 'latest', name: 'MicroPython Latest', date: '2024-01-20', description: 'Latest MicroPython firmware', url: 'https://micropython.org/download/rp2-pico/rp2-pico-latest.uf2' },
            { id: 'v1.22.0', name: 'MicroPython v1.22.0', date: '2023-12-15', description: 'Stable MicroPython release' }
        ]
    }
};

function initFirmwareFlasher() {
    const projectSelector = document.getElementById('projectSelector');
    const versionSelector = document.getElementById('versionSelector');
    const firmwareInput = document.getElementById('firmwareInput');
    const validateBtn = document.getElementById('validateFirmware');
    const connectBtn = document.getElementById('connectDevice');
    const flashBtn = document.getElementById('flashFirmware');
    const cancelBtn = document.getElementById('cancelFlash');
    const clearConsoleBtn = document.getElementById('clearConsole');
    
    // Check Web Serial API support
    if (!('serial' in navigator)) {
        showFeedback('⚠️ Web Serial API not supported. Please use Chrome or Edge browser.', 'error');
        disableControls();
        return;
    }
    
    // Project selector change
    if (projectSelector) {
        projectSelector.addEventListener('change', function() {
            const projectId = this.value;
            state.selectedProject = projectId;
            
            if (projectId && projectData[projectId]) {
                populateVersions(projectId);
                versionSelector.disabled = false;
                logToConsole(`Selected project: ${projectData[projectId].name}`, 'info');
            } else {
                versionSelector.disabled = true;
                versionSelector.innerHTML = '<option value="">Select project first...</option>';
                firmwareInput.value = '';
                state.selectedVersion = null;
            }
            updateFlashButton();
        });
    }
    
    // Version selector change
    if (versionSelector) {
        versionSelector.addEventListener('change', function() {
            const versionId = this.value;
            state.selectedVersion = versionId;
            
            if (versionId && state.selectedProject) {
                const project = projectData[state.selectedProject];
                const version = project.versions.find(v => v.id === versionId);
                
                if (version && version.url) {
                    firmwareInput.value = version.url;
                    state.firmwareUrl = version.url;
                    validateFirmwareUrl(version.url);
                    logToConsole(`Selected version: ${version.name} - ${version.description}`, 'info');
                }
            }
            updateFlashButton();
        });
    }
    
    // Firmware input validation
    if (firmwareInput) {
        firmwareInput.addEventListener('input', function() {
            const url = this.value.trim();
            if (url === '') {
                showFeedback('', '');
                state.firmwareUrl = null;
            }
            updateFlashButton();
        });
        
        firmwareInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && validateBtn) {
                validateBtn.click();
            }
        });
    }
    
    // Validate button
    if (validateBtn) {
        validateBtn.addEventListener('click', function() {
            const url = firmwareInput.value.trim();
            if (url) {
                validateFirmwareUrl(url);
            } else {
                showFeedback('⚠️ Please enter a firmware URL', 'error');
            }
        });
    }
    
    // Connect device button
    if (connectBtn) {
        connectBtn.addEventListener('click', async function() {
            if (state.connected) {
                await disconnectDevice();
            } else {
                await connectDevice();
            }
        });
    }
    
    // Flash firmware button
    if (flashBtn) {
        flashBtn.addEventListener('click', async function() {
            if (state.firmwareUrl && state.connected) {
                await flashFirmware();
            }
        });
    }
    
    // Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            cancelFlashing();
        });
    }
    
    // Clear console button
    if (clearConsoleBtn) {
        clearConsoleBtn.addEventListener('click', function() {
            const consoleLog = document.getElementById('consoleLog');
            if (consoleLog) {
                consoleLog.innerHTML = '';
            }
        });
    }
    
    // Example firmware buttons
    const exampleBtns = document.querySelectorAll('.example-btn');
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const project = this.dataset.project;
            const url = this.dataset.url;
            
            if (projectSelector && project) {
                projectSelector.value = project;
                projectSelector.dispatchEvent(new Event('change'));
            }
            
            if (url && firmwareInput) {
                firmwareInput.value = url;
                state.firmwareUrl = url;
                validateFirmwareUrl(url);
            }
        });
    });
}

function populateVersions(projectId) {
    const versionSelector = document.getElementById('versionSelector');
    if (!versionSelector || !projectData[projectId]) return;
    
    const project = projectData[projectId];
    versionSelector.innerHTML = '<option value="">Select a version...</option>';
    
    project.versions.forEach(version => {
        const option = document.createElement('option');
        option.value = version.id;
        option.textContent = version.name;
        option.dataset.description = version.description;
        option.dataset.date = version.date;
        versionSelector.appendChild(option);
    });
}

function validateFirmwareUrl(url) {
    if (!isValidURL(url)) {
        showFeedback('⚠️ Invalid URL format', 'error');
        state.firmwareUrl = null;
        updateFlashButton();
        return false;
    }
    
    // Check for HTTPS (recommended for security)
    try {
        const urlObj = new URL(url);
        if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
            showFeedback('⚠️ Only HTTP/HTTPS URLs are supported', 'error');
            state.firmwareUrl = null;
            updateFlashButton();
            return false;
        }
        
        // Warn if using HTTP instead of HTTPS
        if (urlObj.protocol === 'http:') {
            logToConsole('⚠️ Warning: Using unencrypted HTTP connection. HTTPS is recommended for security.', 'warning');
        }
    } catch (e) {
        showFeedback('⚠️ Invalid URL format', 'error');
        state.firmwareUrl = null;
        updateFlashButton();
        return false;
    }
    
    // File extension validation
    // NOTE: Different platforms use different firmware formats:
    // - ESP32/ESP8266: .bin
    // - Raspberry Pi Pico (RP2040): .uf2
    // - Arduino: .hex
    // - Some platforms: .elf
    // PRODUCTION RECOMMENDATION: Make extensions configurable per project type
    
    // Extract actual file extension (last occurrence after final dot)
    const urlPath = url.split('?')[0]; // Remove query parameters
    const lastDotIndex = urlPath.lastIndexOf('.');
    const extension = lastDotIndex !== -1 ? urlPath.substring(lastDotIndex).toLowerCase() : '';
    
    const validExtensions = ['.bin', '.uf2', '.hex', '.elf'];
    const hasValidExtension = validExtensions.includes(extension);
    
    if (!hasValidExtension) {
        showFeedback('⚠️ Invalid firmware file. Expected .bin, .uf2, .hex, or .elf file', 'error');
        state.firmwareUrl = null;
        updateFlashButton();
        return false;
    }
    
    showFeedback('✓ Valid firmware URL detected', 'success');
    state.firmwareUrl = url;
    updateFlashButton();
    logToConsole(`Firmware URL validated: ${url}`, 'success');
    return true;
}

async function connectDevice() {
    try {
        showConnectionStatus(true);
        logToConsole('Requesting serial port access...', 'info');
        
        // Request port access
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        
        state.port = port;
        state.connected = true;
        
        updateConnectionStatus('Connected', true);
        logToConsole('✓ Device connected successfully', 'success');
        
        // Try to detect device info (simplified)
        await detectDeviceInfo();
        
        updateConnectButton();
        updateFlashButton();
        
    } catch (error) {
        console.error('Connection error:', error);
        logToConsole(`✗ Connection failed: ${error.message}`, 'error');
        showFeedback('⚠️ Failed to connect to device. Make sure drivers are installed.', 'error');
        state.connected = false;
        updateConnectionStatus('Disconnected', false);
    }
}

async function disconnectDevice() {
    try {
        if (state.port) {
            await state.port.close();
            state.port = null;
        }
        state.connected = false;
        state.device = null;
        
        updateConnectionStatus('Disconnected', false);
        updateConnectButton();
        updateFlashButton();
        hideDeviceInfo();
        logToConsole('Device disconnected', 'info');
        
    } catch (error) {
        console.error('Disconnect error:', error);
        logToConsole(`Error disconnecting: ${error.message}`, 'error');
    }
}

/**
 * Detects device information from connected serial port
 * 
 * NOTE: This is a STUB for demonstration purposes
 * In production, implement actual device detection using:
 * - esptool-js for ESP32/ESP8266 (reads chip ID, MAC, flash size)
 * - Device-specific protocols for other platforms
 * - USB device descriptors for initial identification
 * 
 * @returns {Promise<Object>} Device information object
 */
async function detectDeviceInfo() {
    // STUB: Returns placeholder values for UI demonstration
    // TODO: Replace with actual device detection logic
    const deviceInfo = {
        chipType: state.selectedProject ? projectData[state.selectedProject]?.chipFamily : 'Unknown',
        macAddress: 'N/A (detection not implemented)',
        flashSize: 'N/A (detection not implemented)'
    };
    
    state.device = deviceInfo;
    displayDeviceInfo(deviceInfo);
}

function displayDeviceInfo(info) {
    const deviceInfoDiv = document.getElementById('deviceInfo');
    if (!deviceInfoDiv) return;
    
    // Create element and set text content (not innerHTML) for security
    const h4 = document.createElement('h4');
    h4.textContent = '📱 Device Information';
    
    const p1 = document.createElement('p');
    p1.innerHTML = '<strong>Chip Type:</strong> ';
    p1.appendChild(document.createTextNode(info.chipType));
    
    const p2 = document.createElement('p');
    p2.innerHTML = '<strong>MAC Address:</strong> ';
    p2.appendChild(document.createTextNode(info.macAddress));
    
    const p3 = document.createElement('p');
    p3.innerHTML = '<strong>Flash Size:</strong> ';
    p3.appendChild(document.createTextNode(info.flashSize));
    
    deviceInfoDiv.innerHTML = '';
    deviceInfoDiv.appendChild(h4);
    deviceInfoDiv.appendChild(p1);
    deviceInfoDiv.appendChild(p2);
    deviceInfoDiv.appendChild(p3);
    deviceInfoDiv.style.display = 'block';
}

function hideDeviceInfo() {
    const deviceInfoDiv = document.getElementById('deviceInfo');
    if (deviceInfoDiv) {
        deviceInfoDiv.style.display = 'none';
    }
}

async function flashFirmware() {
    if (!state.firmwareUrl || !state.connected) {
        showFeedback('⚠️ Please connect device and select firmware', 'error');
        return;
    }
    
    // Enhanced confirmation dialog with clear warnings
    // NOTE: Using native confirm() for simplicity in this demo
    // For production, implement a custom modal with:
    // - Checkbox confirmations for each safety step
    // - Display of firmware checksum/hash if available
    // - Better visual hierarchy and styling
    // - "I understand the risks" checkbox
    
    // Sanitize display values to prevent any potential issues
    const deviceType = (state.device?.chipType || 'Unknown').replace(/[<>&"']/g, '');
    const fileName = state.firmwareUrl.split('/').pop().replace(/[<>&"']/g, '');
    const urlHostname = new URL(state.firmwareUrl).hostname;
    
    const confirmed = confirm(
        `⚠️ FIRMWARE FLASH CONFIRMATION\n\n` +
        `This will ERASE ALL DATA on your device and install new firmware.\n\n` +
        `Device: ${deviceType}\n` +
        `Firmware: ${fileName}\n` +
        `Source: ${urlHostname}\n\n` +
        `IMPORTANT WARNINGS:\n` +
        `• All existing data will be permanently deleted\n` +
        `• Only flash firmware from trusted sources\n` +
        `• Incorrect firmware can brick your device\n` +
        `• Keep the device connected during the entire process\n\n` +
        `Do you want to continue?`
    );
    
    if (!confirmed) {
        logToConsole('Flashing cancelled by user', 'warning');
        return;
    }
    
    state.isFlashing = true;
    showProgressSection(true);
    showCancelButton(true);
    updateFlashButton();
    
    try {
        logToConsole('Starting firmware flash process...', 'info');
        
        // NOTE: This is a UI simulation for demonstration purposes
        // In production, integrate esptool-js or similar library for actual flashing
        // Example: await esptool.flash(state.firmwareUrl, state.port);
        await simulateFlashing();
        
        logToConsole('✓ Firmware flashed successfully!', 'success');
        showFeedback('✓ Firmware flashed successfully! Device will reboot.', 'success');
        updateProgress(100, 'Complete!', '100%');
        
        setTimeout(() => {
            showProgressSection(false);
            showCancelButton(false);
        }, 3000);
        
    } catch (error) {
        console.error('Flashing error:', error);
        logToConsole(`✗ Flashing failed: ${error.message}`, 'error');
        showFeedback('✗ Flashing failed. Please try again.', 'error');
    } finally {
        state.isFlashing = false;
        updateFlashButton();
        showCancelButton(false);
    }
}

/**
 * Simulates the firmware flashing process for UI demonstration
 * 
 * NOTE: This is ONLY a simulation for testing the user interface.
 * It does NOT perform actual firmware flashing to hardware.
 * 
 * For production use with real devices, replace this with:
 * - esptool-js for ESP32/ESP8266 devices
 * - Web USB API for devices that support it
 * - Appropriate flashing library for other platforms
 * 
 * @returns {Promise<void>}
 */
async function simulateFlashing() {
    const steps = [
        { progress: 10, status: 'Connecting to device...', time: 500 },
        { progress: 20, status: 'Erasing flash...', time: 1000 },
        { progress: 40, status: 'Writing firmware...', time: 2000 },
        { progress: 70, status: 'Writing firmware...', time: 2000 },
        { progress: 90, status: 'Verifying...', time: 1000 },
        { progress: 100, status: 'Complete!', time: 500 }
    ];
    
    for (const step of steps) {
        if (!state.isFlashing) {
            throw new Error('Flashing cancelled');
        }
        
        await new Promise(resolve => setTimeout(resolve, step.time));
        
        const speed = Math.floor(Math.random() * 100) + 50;
        const timeLeft = Math.floor((100 - step.progress) / 10);
        
        updateProgress(
            step.progress,
            step.status,
            `${step.progress}%`,
            `${speed} KB/s`,
            `${timeLeft}s remaining`
        );
        
        logToConsole(`${step.status} (${step.progress}%)`, 'info');
    }
}

function cancelFlashing() {
    if (state.isFlashing) {
        state.isFlashing = false;
        logToConsole('Flashing cancelled by user', 'warning');
        showFeedback('⚠️ Flashing cancelled', 'warning');
        showProgressSection(false);
        showCancelButton(false);
        updateFlashButton();
    }
}

function updateProgress(percent, status, percentText, speed = '--', timeRemaining = '--') {
    const progressBar = document.getElementById('progressBar');
    const progressStatus = document.getElementById('progressStatus');
    const progressPercent = document.getElementById('progressPercent');
    const transferSpeed = document.getElementById('transferSpeed');
    const timeRemainingEl = document.getElementById('timeRemaining');
    
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressStatus) progressStatus.textContent = status;
    if (progressPercent) progressPercent.textContent = percentText;
    if (transferSpeed) transferSpeed.textContent = speed;
    if (timeRemainingEl) timeRemainingEl.textContent = timeRemaining;
}

function showProgressSection(show) {
    const progressSection = document.getElementById('progressSection');
    if (progressSection) {
        progressSection.style.display = show ? 'block' : 'none';
        if (show) {
            updateProgress(0, 'Preparing...', '0%');
        }
    }
}

function showCancelButton(show) {
    const cancelBtn = document.getElementById('cancelFlash');
    if (cancelBtn) {
        cancelBtn.style.display = show ? 'inline-flex' : 'none';
    }
}

function updateConnectionStatus(text, connected) {
    const statusDiv = document.getElementById('connectionStatus');
    const statusText = statusDiv?.querySelector('.status-text');
    
    if (statusDiv) {
        statusDiv.style.display = 'flex';
        if (connected) {
            statusDiv.classList.add('connected');
        } else {
            statusDiv.classList.remove('connected');
        }
    }
    
    if (statusText) {
        statusText.textContent = text;
    }
}

function showConnectionStatus(show) {
    const statusDiv = document.getElementById('connectionStatus');
    if (statusDiv) {
        statusDiv.style.display = show ? 'flex' : 'none';
    }
}

function updateConnectButton() {
    const connectBtn = document.getElementById('connectDevice');
    if (!connectBtn) return;
    
    if (state.connected) {
        connectBtn.textContent = '🔌 Disconnect Device';
        connectBtn.classList.remove('btn-primary');
        connectBtn.classList.add('btn-secondary');
    } else {
        connectBtn.textContent = '🔌 Connect Device';
        connectBtn.classList.remove('btn-secondary');
        connectBtn.classList.add('btn-primary');
    }
}

function updateFlashButton() {
    const flashBtn = document.getElementById('flashFirmware');
    const connectBtn = document.getElementById('connectDevice');
    
    if (!flashBtn || !connectBtn) return;
    
    const hasValidFirmware = state.firmwareUrl !== null;
    const canConnect = hasValidFirmware;
    const canFlash = hasValidFirmware && state.connected && !state.isFlashing;
    
    connectBtn.disabled = !canConnect;
    flashBtn.disabled = !canFlash;
    
    if (state.isFlashing) {
        flashBtn.textContent = '⚡ Flashing...';
    } else {
        flashBtn.textContent = '⚡ Flash Firmware';
    }
}

function showFeedback(message, type) {
    const feedback = document.getElementById('firmwareFeedback');
    if (!feedback) return;
    
    feedback.textContent = message;
    feedback.className = 'firmware-feedback ' + type;
}

function logToConsole(message, type = 'info') {
    const consoleOutput = document.getElementById('consoleOutput');
    const consoleLog = document.getElementById('consoleLog');
    
    if (!consoleOutput || !consoleLog) return;
    
    consoleOutput.style.display = 'block';
    
    const timestamp = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.className = `console-line ${type}`;
    line.textContent = `[${timestamp}] ${message}`;
    
    consoleLog.appendChild(line);
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

function disableControls() {
    const controls = [
        'projectSelector',
        'versionSelector',
        'firmwareInput',
        'validateFirmware',
        'connectDevice',
        'flashFirmware'
    ];
    
    controls.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
    });
}

/**
 * Parses and validates URL query parameters
 * Supports: ?firmware=<url>, ?project=<id>, ?version=<id>
 * 
 * NOTE: Parameters are validated before use to prevent security issues
 */
function parseURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for firmware parameter
    const firmwareUrl = urlParams.get('firmware');
    if (firmwareUrl) {
        // Validate and sanitize firmware URL
        const firmwareInput = document.getElementById('firmwareInput');
        if (firmwareInput && isValidURL(firmwareUrl)) {
            // URL validation will be performed by validateFirmwareUrl
            firmwareInput.value = firmwareUrl;
            validateFirmwareUrl(firmwareUrl);
            logToConsole(`Firmware URL loaded from URL parameter: ${firmwareUrl}`, 'info');
        } else {
            logToConsole('⚠️ Invalid firmware URL in query parameter', 'warning');
        }
    }
    
    // Check for project parameter
    const project = urlParams.get('project');
    if (project) {
        // Validate project exists in projectData (prevents injection)
        const projectSelector = document.getElementById('projectSelector');
        if (projectSelector && projectData[project]) {
            projectSelector.value = project;
            projectSelector.dispatchEvent(new Event('change'));
            logToConsole(`Project loaded from URL parameter: ${project}`, 'info');
        } else if (project) {
            logToConsole(`⚠️ Unknown project in URL parameter: ${project}`, 'warning');
        }
    }
    
    // Check for version parameter
    const version = urlParams.get('version');
    if (version && project) {
        // Validate version exists for the selected project
        setTimeout(() => {
            const versionSelector = document.getElementById('versionSelector');
            if (versionSelector) {
                const projectVersions = projectData[project]?.versions || [];
                const validVersion = projectVersions.find(v => v.id === version);
                
                if (validVersion) {
                    versionSelector.value = version;
                    versionSelector.dispatchEvent(new Event('change'));
                    logToConsole(`Version loaded from URL parameter: ${version}`, 'info');
                } else {
                    logToConsole(`⚠️ Unknown version for project ${project}: ${version}`, 'warning');
                }
            }
        }, 100);
    }
}

function isValidURL(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// ===================================
// Scroll Animations
// ===================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe cards
    document.querySelectorAll('.feature-card, .project-card').forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
    });
}

// ===================================
// Smooth Scroll
// ===================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===================================
// Particle Effect (Optional Enhancement)
// ===================================

function createParticles() {
    const PARTICLE_DENSITY_FACTOR = 15000; // Controls particle density based on canvas size
    
    const canvas = document.createElement('canvas');
    canvas.id = 'particles';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2;
            this.opacity = Math.random() * 0.5;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 212, 255, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    function init() {
        particles = [];
        const particleCount = Math.floor((canvas.width * canvas.height) / PARTICLE_DENSITY_FACTOR);
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 212, 255, ${0.2 * (1 - distance / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    init();
    animate();
}

// Uncomment to enable particle effect
// createParticles();

// ===================================
// Copy to Clipboard Functionality
// ===================================

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('✓ Copied to clipboard!');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        // Note: document.execCommand is deprecated but used here as fallback for older browsers
        // that don't support the modern navigator.clipboard API
        document.execCommand('copy');
        showNotification('✓ Copied to clipboard!');
    } catch (err) {
        showNotification('✗ Failed to copy');
    }
    
    document.body.removeChild(textArea);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
        color: white;
        border-radius: var(--radius-lg);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: fadeInUp 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
