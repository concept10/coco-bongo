module.exports = function (RED) {
    function CocoL5KParserNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        const fs = require("fs");

        node.on("input", function (msg) {
            const filePath = msg.payload; // Expecting the .L5K file path

            fs.readFile(filePath, "utf8", (err, data) => {
                if (err) {
                    node.error("Error reading L5K file: " + err, msg);
                    return;
                }

                try {
                    // Extract controller name
                    const controllerMatch = data.match(/CONTROLLER\s+(\w+)/);
                    const controllerName = controllerMatch ? controllerMatch[1] : "Unknown";

                    // Extract tags
                    const tagRegex = /TAG\s+(\w+)\s+(\w+)\s*:=\s*([^;]+);/g;
                    let tags = [];
                    let match;
                    while ((match = tagRegex.exec(data)) !== null) {
                        tags.push({ name: match[1], type: match[2], value: match[3].trim() });
                    }

                    // Extract programs
                    const programRegex = /PROGRAM\s+(\w+)/g;
                    let programs = [];
                    while ((match = programRegex.exec(data)) !== null) {
                        programs.push(match[1]);
                    }

                    // Construct output JSON
                    msg.payload = {
                        controllerName,
                        programs,
                        tags
                    };

                    node.send(msg);
                } catch (error) {
                    node.error("Parsing error: " + error, msg);
                }
            });
        });
    }

    RED.nodes.registerType("coco-l5k", CocoL5KParserNode);
};