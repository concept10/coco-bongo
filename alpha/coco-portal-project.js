module.exports = function (RED) {
    function CocoTIAParserNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        const fs = require("fs");
        const xml2js = require("xml2js");

        node.on("input", function (msg) {
            const filePath = msg.payload; // Expecting the TIA Portal project file path

            fs.readFile(filePath, "utf8", (err, data) => {
                if (err) {
                    node.error("Error reading TIA Portal file: " + err, msg);
                    return;
                }

                xml2js.parseString(data, (err, result) => {
                    if (err) {
                        node.error("Error parsing TIA Portal file: " + err, msg);
                        return;
                    }

                    try {
                        // Extract controller name
                        const controllerName = result.Project.Controller[0].$.Name || "Unknown";

                        // Extract tags
                        const tags = result.Project.Controller[0].Tags[0].Tag.map(tag => ({
                            name: tag.$.Name,
                            type: tag.$.DataType,
                            value: tag.$.InitialValue
                        }));

                        // Extract programs
                        const programs = result.Project.Controller[0].Programs[0].Program.map(program => program.$.Name);

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
        });
    }

    RED.nodes.registerType("coco-tia", CocoTIAParserNode);
};