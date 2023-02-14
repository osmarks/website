// Chooses a random element from an array
function choose(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

// A collection of jargon
jargonWords = {
   acronyms: 
      ["TCP", "HTTP", "SDD", "RAM", "GB", "CSS", "SSL", "AGP", "SQL", "FTP", "PCI", "AI", "ADP",
       "RSS", "XML", "EXE", "COM", "HDD", "THX", "SMTP", "SMS", "USB", "PNG", "PHP", "UDP", 
       "TPS", "RX", "ASCII", "CD-ROM", "CGI", "CPU", "DDR", "DHCP", "BIOS", "IDE", "IP", "MAC", 
       "MP3", "AAC", "PPPoE", "SSD", "SDRAM", "VGA", "XHTML", "Y2K", "GUI", "EPS", "SATA", "SAS",
       "VM", "LAN", "DRAM", "L3", "L2", "DNS", "UEFI", "UTF-8", "DDOS", "HDMI", "GPU", "RSA", "AES",
       "L7", "ISO", "HTTPS", "SSH", "SIMD", "GNU", "PDF", "LPDDR5", "ARM", "RISC", "CISC", "802.11",
       "5G", "LTE", "3GPP", "MP4", "2FA", "RCE", "JBIG2", "ISA", "PCIe", "NVMe", "SHA", "QR", "CUDA",
       "IPv4", "IPv6", "ARP", "DES", "IEEE", "NoSQL", "UTF-16", "ADSL", "ABI", "TX", "HEVC", "AVC",
       "AV1", "ASLR", "ECC", "HBA", "HAL", "SMT", "RPC", "JIT", "LCD", "LED", "MIME", "MIMO", "LZW",
       "LGA", "OFDM", "ORM", "PCRE", "POP3", "SMTP", "802.3", "PSU", "RGB", "VLIW", "VPS", "VPN",
       "XMPP", "IRC", "GNSS"], 
   adjectives:
      ["auxiliary", "primary", "back-end", "digital", "open-source", "virtual", "cross-platform",
       "redundant", "online", "haptic", "multi-byte", "Bluetooth", "wireless", "1080p", "neural",
       "optical", "solid state", "mobile", "unicode", "backup", "high speed", "56k", "analog", 
       "fiber optic", "central", "visual", "ethernet", "Griswold", "binary", "ternary",
       "secondary", "web-scale", "persistent", "Java", "cloud", "hyperscale", "seconday", "cloudscale",
       "software-defined", "hyperconverged", "x86", "Ethernet", "WiFi", "4k", "gigabit", "neuromorphic",
       "sparse", "machine learning", "authentication", "multithreaded", "statistical", "nonlinear",
       "photonic", "streaming", "concurrent", "memory-safe", "C", "electromagnetic", "nanoscale",
       "high-level", "low-level", "distributed", "accelerated", "base64", "purely functional",
       "serial", "parallel", "compute", "graphene", "recursive", "denormalized", "orbital",
       "networked", "autonomous", "applicative", "acausal", "hardened", "category-theoretic",
       "ultrasonic"
    ], 
   nouns:
      ["driver", "protocol", "bandwidth", "panel", "microchip", "program", "port", "card", 
       "array", "interface", "system", "sensor", "firewall", "hard drive", "pixel", "alarm", 
       "feed", "monitor", "application", "transmitter", "bus", "circuit", "capacitor", "matrix", 
       "address", "form factor", "array", "mainframe", "processor", "antenna", "transistor", 
       "virus", "malware", "spyware", "network", "internet", "field", "acutator", "tetryon",
       "beacon", "resonator", "diode", "oscillator", "vertex", "shader", "cache", "platform",
       "hyperlink", "device", "encryption", "node", "headers", "botnet", "applet", "satellite",
       "Unix", "byte", "Web 3", "metaverse", "microservice", "ultrastructure", "subsystem",
       "call stack", "gate", "filesystem", "file", "database", "bitmap", "Bloom filter", "tensor",
       "hash table", "tree", "optics", "silicon", "hardware", "uplink", "script", "tunnel",
       "server", "barcode", "exploit", "vulnerability", "backdoor", "computer", "page",
       "regex", "socket", "platform", "IP", "compiler", "interpreter", "nanochip", "certificate",
       "API", "bitrate", "acknowledgement", "layout", "satellite", "shell", "MAC", "PHY", "VLAN",
       "SoC", "assembler", "interrupt", "directory", "display", "functor", "bits", "logic",
       "sequence", "procedure", "subnet", "invariant", "monad", "endofunctor", "borrow checker"], 
   participles:
      ["backing up", "bypassing", "hacking", "overriding", "compressing", "copying", "navigating", 
       "indexing", "connecting", "generating", "quantifying", "calculating", "synthesizing", 
       "inputting", "transmitting", "programming", "rebooting", "parsing", "shutting down", 
       "injecting", "transcoding", "encoding", "attaching", "disconnecting", "networking",
       "triaxilating", "multiplexing", "interplexing", "rewriting", "transducing",
       "acutating", "polarising", "diffracting", "modulating", "demodulating", "vectorizing",
       "compiling", "jailbreaking", "proxying", "Linuxing", "quantizing", "multiplying",
       "scanning", "interpreting", "routing", "rerouting", "tunnelling", "randomizing",
       "underwriting", "accessing", "locating", "rotating", "invoking", "utilizing",
       "normalizing", "hijacking", "integrating", "type-checking", "uploading", "downloading",
       "allocating", "receiving", "decoding"
]};

// Generates a random piece of jargon
function jargon() {
    var choice = Math.random()
    if (choice > 0.5) {
        var thing = choose(jargonWords.adjectives) + " " + choose(jargonWords.acronyms)
    } else if (choice > 0.1) {
        var thing = choose(jargonWords.acronyms) + " " + choose(jargonWords.adjectives)
    } else {
        var thing = choose(jargonWords.adjectives) + " " + choose(jargonWords.acronyms) + " " + choose(jargonWords.nouns)
    }
    thing += " " + choose(jargonWords.nouns)
    if (Math.random() > 0.3) {
        var raw = choose(jargonWords.participles) + " " + thing
    } else {
        var raw = thing + " " + choose(jargonWords.participles)
            .replace("writing", "wrote")
            .replace("breaking", "broken")
            .replace("overriding", "overriden")
            .replace("shutting", "shut")
            .replace("ying", "ied")
            .replace("ing", "ed")
    }
    return raw.capitalizeFirstLetter()
}

/* Graphics stuff */
function Square(z) {
    this.width = settings.canvas.width/2;
    this.height = settings.canvas.height;
    z = z || 0;

    var canvas = settings.canvas;

    this.points = [
        new Point({
            x: (canvas.width / 2) - this.width,
            y: (canvas.height / 2) - this.height,
            z: z,
        }),
        new Point({
            x: (canvas.width / 2) + this.width,
            y: (canvas.height / 2) - this.height,
            z: z
        }),
        new Point({
            x: (canvas.width / 2) + this.width,
            y: (canvas.height / 2) + this.height,
            z: z
        }),
        new Point( {
            x: (canvas.width / 2) - this.width,
            y: (canvas.height / 2) + this.height,
            z: z
        })
    ];
    this.dist = 0;
}

Square.prototype.update = function () {
    for (var p = 0; p < this.points.length; p++) {
        this.points[p].rotateZ(0.001);
        this.points[p].z -= 3;
        if (this.points[p].z < -300) {
            this.points[p].z = 2700;
        }
        this.points[p].map2D();
    }
};

Square.prototype.render = function () {
    settings.ctx.beginPath();
    settings.ctx.moveTo(this.points[0].xPos, this.points[0].yPos);

    for (var p = 1; p < this.points.length; p++) {
        if (this.points[p].z > -(settings.focal - 50)) {
            settings.ctx.lineTo(this.points[p].xPos, this.points[p].yPos);
        }
    }

    settings.ctx.closePath();
    settings.ctx.stroke();

    this.dist = this.points[this.points.length - 1].z;
};

function Point(pos) {
    this.x = pos.x - settings.canvas.width / 2 || 0;
    this.y = pos.y - settings.canvas.height / 2 || 0;
    this.z = pos.z || 0;

    this.cX = 0;
    this.cY = 0;
    this.cZ = 0;

    this.xPos = 0;
    this.yPos = 0;

    this.map2D();
}

Point.prototype.rotateZ = function (angleZ) {
    var cosZ = Math.cos(angleZ),
        sinZ = Math.sin(angleZ),
        x1 = this.x * cosZ - this.y * sinZ,
        y1 = this.y * cosZ + this.x * sinZ;

    this.x = x1;
    this.y = y1;
};

Point.prototype.map2D = function () {
    var scaleX = settings.focal / (settings.focal + this.z + this.cZ),
        scaleY = settings.focal / (settings.focal + this.z + this.cZ);

    this.xPos = settings.vpx + (this.cX + this.x) * scaleX;
    this.yPos = settings.vpy + (this.cY + this.y) * scaleY;
};

// ** Main function **//
function GuiHacker(){
    this.squares = [];

    this.barVals = [];
    this.sineVal = [];

    for (var i = 0; i < 15; i++) {
        this.squares.push(new Square(-300 + (i * 200)));
    }

    // Console stuff
    this.responses = [
        'Authorizing ',
        'Authorized...',
        'Access Granted..',
        'Going Deeper....',
        'Compression Complete.',
        'Compilation of Data Structures Complete..',
        'Entering Security Console...',
        'Encryption Unsuccesful Attempting Retry...',
        'Waiting for response...',
        '....Searching...',
        'Calculating Space Requirements',
        "nmap 192.168.1.0/24 -p0-65535",
        "Rescanning Databases...",
        "Hacking all IPs simultaneously...",
        "All webs down, activating proxy",
        "rm -rf --no-preserve-root /",
        "Hacking military satellite network...",
        "Guessing password...",
        "Trying 'password123'",
        "Activating Extra Monitors...",
        "Typing Faster...",
        "Checking StackOverflow",
        "Locating crossbows...",
        "Enabling algorithms and coding",
        "Collapsing Subdirectories...",
        "Enabling Ping Wall...",
        "Obtaining sunglasses...",
        "Rehashing hashes.",
        "Randomizing numbers.",
        "Greening text...",
        "Accessing system32",
        "'); DROP DATABASE system;--",
        "...Nesting VPNs...",
        "Opening Wireshark.",
        "Breaking fifth wall....",
        "Flipping arrows and applying yoneda lemma",
        "Rewriting in Rust"
    ];
    this.isProcessing = false;
    this.processTime = 0;
    this.lastProcess = 0;

    this.render();
    this.consoleOutput();
}

var progressBar = document.querySelector(".progress")
var barProgress = 1

GuiHacker.prototype.render = function(){
    var ctx = settings.ctx,
        canvas = settings.canvas,
        ctxBars = settings.ctxBars,
        canvasBars = settings.canvasBars;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.squares.sort(function (a, b) {
        return b.dist - a.dist;
    });

    for (var i = 0, len = this.squares.length; i < len; i++) {
        var square = this.squares[i];
        square.update();
        square.render();
    }

    ctxBars.clearRect(0, 0, canvasBars.width, canvasBars.height);

    ctxBars.beginPath();
    var y = canvasBars.height/6;
    ctxBars.moveTo(0,y);

    for(i = 0; i < canvasBars.width; i++){
        var ran = (Math.random()*20)-10;
        if(Math.random() > 0.98){
             ran = (Math.random()*50)-25;
        }
        ctxBars.lineTo(i, y + ran);
    }

    ctxBars.stroke();

    for(i = 0; i < canvasBars.width; i+=20){
        if(!this.barVals[i]){
            this.barVals[i] = {
                val : Math.random()*(canvasBars.height/2),
                freq : 0.1,
                sineVal : Math.random()*100
            };
        }

        var barVal = this.barVals[i];
        barVal.sineVal+=barVal.freq;
        barVal.val+=Math.sin(barVal.sineVal*Math.PI/2)*5;
        ctxBars.fillRect(i+5,canvasBars.height,15,-barVal.val);
    }

    barProgress += 0.0001
    if (barProgress < 1) {
        progressBar.style.display = "block"
        progressBar.style.backgroundImage = `linear-gradient(to right, green, green ${barProgress * 100}%, black ${barProgress * 100}%, black 100%)`
        progressBar.innerHTML = `${Math.floor(barProgress * 100)}%`
    } else {
        progressBar.style.display = "none"
    }

    var self = this;
    requestAnimationFrame(function(){self.render();});
};

// Generates a random binary, hexadecimal or floating-point number (as a string)
function scaryNum() {
    let rand = Math.random()
    let rand2 = Math.random()
    
    if (rand2 > 0.7) {
        let bigNum = rand * 1000000000
        return bigNum.toString(16).split('.')[0] // big hexadecimal
    } else if (rand2 > 0.4) {
        let longNum = rand * 100000000000
        return longNum.toString(2).split('.')[0] // big binary
    } else {
        return rand.toString() // float
    }
}

var accessDenied = document.querySelector(".accessdenied")

GuiHacker.prototype.consoleOutput = function(initiatedByTyping){
    var textEl = document.createElement('p');

    if(this.isProcessing){
        textEl = document.createElement('span');
        textEl.textContent += scaryNum() + " ";
        if(Date.now() > this.lastProcess + this.processTime){
            this.isProcessing = false;
        }
        if (initiatedByTyping) {
            this.processTime -= 500
        }
    }else{
        var commandType = ~~(Math.random()*4);
        switch(commandType){
            case 0:
                textEl.textContent = jargon()
                break;
            case 3:
                this.isProcessing = true;
                this.processTime = ~~(Math.random()*5000);
                this.lastProcess = Date.now();
                break;
            default:
                 textEl.textContent = this.responses[~~(Math.random()*this.responses.length)];
            break;
        }
    }

    var outputConsole = settings.outputConsole;
    if (outputConsole.childNodes.length > 1000) {
        outputConsole.removeChild(outputConsole.firstChild)
    }
    outputConsole.scrollTop = outputConsole.scrollHeight;
    outputConsole.appendChild(textEl);

    if (outputConsole.scrollHeight > window.innerHeight) {
       var removeNodes = outputConsole.querySelectorAll('*');
       for(var n = 0; n < ~~(removeNodes.length/3); n++){
            outputConsole.removeChild(removeNodes[n]);
        }
    }

    var self = this;
    if (!initiatedByTyping) { setTimeout(function(){self.consoleOutput();}, ~~(Math.random()*200)) };
};


// Settings
var settings = {
       canvas           : document.querySelector(".hacker-3d-shiz"),
       ctx              : document.querySelector(".hacker-3d-shiz").getContext("2d"),
       canvasBars       : document.querySelector(".bars-and-stuff"),
       ctxBars          : document.querySelector(".bars-and-stuff").getContext("2d"),
       outputConsole    : document.querySelector(".output-console"),
       vpx              : 0,
       vpy              : 0,
       focal            : 0,
       color            : "#00FF00",
       title            : "Gui Hacker",
       gui              : true
    },
    hash = decodeURIComponent(document.location.hash.substring(1)),
    userSettings = {};

if (hash){
    userSettings = JSON.parse(hash);
    if(userSettings && userSettings.title !== undefined){
        document.title = userSettings.title;
    }

    if(userSettings && userSettings.gui !== undefined){
        settings.gui = userSettings.gui;
    }

    settings.color = userSettings.color || settings.color;
}

var adjustCanvas = function(){
    if(settings.gui) {
        settings.canvas.width = (window.innerWidth/3)*2;
        settings.canvas.height = window.innerHeight / 3;

        settings.canvasBars.width = window.innerWidth/3;
        settings.canvasBars.height = settings.canvas.height;

        settings.outputConsole.style.height = (window.innerHeight / 3) * 2 + 'px';
        settings.outputConsole.style.top = window.innerHeight / 3 + 'px';

        settings.focal = settings.canvas.width / 2;
        settings.vpx = settings.canvas.width / 2;
        settings.vpy = settings.canvas.height / 2;

        settings.ctx.strokeStyle = settings.ctxBars.strokeStyle = settings.ctxBars.fillStyle = settings.color;
    } else {
        document.querySelector(".hacker-3d-shiz").style.display = "none";
        document.querySelector(".bars-and-stuff").style.display = "none";
    }
    document.body.style.color = settings.color;
}
guiHacker = new GuiHacker(settings);


window.addEventListener("resize", adjustCanvas)
window.addEventListener("keydown", ev => {
    if (ev.key === "d" && ev.altKey) {
        console.log("denying access")
        accessDenied.style.display = accessDenied.style.display === "none" ? "block" : "none"
        ev.preventDefault()
    }
    if (ev.key === "p" && ev.altKey) {
        console.log("activating ominous progress bar")
        barProgress = 0
    }
    else if (Math.random() > 0.8) {
        guiHacker.consoleOutput(true)
    }
})
adjustCanvas()