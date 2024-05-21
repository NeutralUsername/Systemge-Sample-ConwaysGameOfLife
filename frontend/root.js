export class root extends React.Component {
    constructor(props) {
        super(props);
        (this.state = {
            WS_CONNECTION: new WebSocket("ws://localhost:8443/ws"),

            SQUARESIZE: 10,
            autoNextGenDelay_ms: 100,

            grid: null,
            nextGenerationLoop: null,
            stateInput : "",
        }),
        (this.state.WS_CONNECTION.onmessage = (event) => {
            let message = JSON.parse(event.data);
            console.log(message);
            switch (message.topic) {
                case "getGrid":
                    let grid = JSON.parse(message.body);
                    let newStateInput = ""
                    grid.grid.forEach((row) => {
                        row.forEach((cell) => {
                            newStateInput += cell
                        })
                    })
                    this.setState({
                        grid: grid,
                        stateInput: newStateInput,
                    });
                    break;
                case "getGridChange": {
                    let gridChange = JSON.parse(message.body);
                    this.state.grid.grid[gridChange.row][gridChange.column] = gridChange.state;
                    let newStateInput = this.state.stateInput
                    newStateInput = newStateInput.substring(0, gridChange.row*this.state.grid.cols+gridChange.column) + gridChange.state + newStateInput.substring(gridChange.row*this.state.grid.cols+gridChange.column+1)
                    this.setState({
                        grid: this.state.grid,
                        stateInput: newStateInput,
                    });
                    break;
                }
                default:
                    console.log("Unknown message topic: " + event.data);
                    break;
            }
        });
        this.state.WS_CONNECTION.onclose = () => {
            setTimeout(() => {
                if (this.state.WS_CONNECTION.readyState === WebSocket.CLOSED) {}
                window.location.reload();
            }, 2000);
        };
        this.state.WS_CONNECTION.onopen = () => {
            let myLoop = () => {
                this.state.WS_CONNECTION.send(this.constructMessage("heartbeat", ""));
                setTimeout(myLoop, 15 * 1000);
            };
            setTimeout(myLoop, 15 * 1000);
        };
    }

    constructMessage = (topic, body) => {
        return JSON.stringify({
            topic: topic,
            body: body,
        });
    };

    startNextGenerationLoop = () => {
        this.state.WS_CONNECTION.send(
            this.constructMessage("nextGeneration", "")
        );
        this.setState({
            nextGenerationLoop: setTimeout(this.startNextGenerationLoop, this.state.autoNextGenDelay_ms),
        });
    }

    render() {
        let gridElements = [];
        if (this.state.grid) {
            this.state.grid.grid.forEach((row, indexRow) => {
                row.forEach((cell, indexCol) => {
                    gridElements.push(
                        React.createElement("div", {
                            key: indexRow*this.state.grid.cols+indexCol,
                            style: {
                                width: this.state.SQUARESIZE + "px",
                                height: this.state.SQUARESIZE + "px",
                                backgroundColor: cell ? "black" : "white",
                                border: "1px solid black",
                                boxSizing: "border-box",
                            },
                            onClick: () =>
                                this.state.WS_CONNECTION.send(
                                    this.constructMessage(
                                        "gridChange",
                                        JSON.stringify({
                                            row :indexRow,
                                            column: indexCol,
                                            state: (cell+1)%2,
                                        })
                                    )
                                ),
                            onMouseOver: (e) => {
                                if (e.buttons === 1) {
                                    this.state.WS_CONNECTION.send(
                                        this.constructMessage(
                                            "gridChange",
                                            JSON.stringify({
                                                row: indexRow,
                                                column: indexCol,
                                                state: (cell+1)%2,
                                            })
                                        )
                                    );
                                }
                            },
                        })
                    );
                })
            });
        }
        return React.createElement(
            "div", {
                id: "root",
                onContextMenu: (e) => {
                    e.preventDefault();
                },
                style: {
                    fontFamily: "sans-serif",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    touchAction : "none",
					userSelect : "none",
                },
            },
            React.createElement(
                "button", {
                    id: "nextGeneration",
                    style: {
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        padding: "5px",
                        backgroundColor: "white",
                        color: "black",
                        fontFamily: "Arial",
                        fontSize: "16px",
                        cursor: "pointer",
                    },
                    onClick: () =>
                        this.state.WS_CONNECTION.send(
                            this.constructMessage("nextGeneration", "")
                        ),
                    innerHTML: "Next Generation",
                },
                "Next Generation"
            ),
            React.createElement("div", {
                    style: {
                        position: "absolute",
                        display: "flex",
                        flexDirection: "row",
                        top: "50px",
                        left: "10px",
                        padding: "5px",
                        border: "1px solid black",
                        borderRadius: "5px",
                        backgroundColor: "white",
                        color: "black",
                        fontFamily: "Arial",
                        fontSize: "16px",
                        gap: "10px",    
                    },
                },
                React.createElement(
                    "button", {
                        id: "nextGenerationLoop",
                        style: {
                            backgroundColor: "white",
                            color: "black",
                            fontFamily: "Arial",
                            fontSize: "16px",
                            cursor: "pointer",
                        },
                        onClick: () => {
                            if (this.state.nextGenerationLoop === null) {
                                this.startNextGenerationLoop ()
                            } else {
                                clearTimeout(this.state.nextGenerationLoop);
                                this.setState({
                                    nextGenerationLoop: null,
                                });
                            }
                        },
                    },
                    this.state.nextGenerationLoop === null ? "Start Loop" : "Stop Loop"
                ),
                React.createElement("input", {
                    id: "autoNextGenDelay",
                    type: "number",
                    style: {
                        width: "65px",
                        height: "20px",
                        padding: "5px",
                        border: "1px solid black",
                        borderRadius: "5px",
                        backgroundColor: "white",
                        color: "black",
                        fontFamily: "Arial",
                        fontSize: "16px",
                    },
                    value: this.state.autoNextGenDelay_ms,
                    onChange: (e) => {
                        this.setState({
                            autoNextGenDelay_ms: e.target.value,
                        });
                    },
                }),
            ),
            React.createElement("div", {
                    style: {
                        position: "absolute",
                        display: "flex",
                        flexDirection: "row",
                        top: "101px",
                        left: "10px",
                        padding: "5px",
                        border: "1px solid black",
                        borderRadius: "5px",
                        backgroundColor: "white",
                        color: "black",
                        fontFamily: "Arial",
                        fontSize: "16px",
                        gap: "10px",  
                    }
                },
                React.createElement("input", {
                        style : {
                            width: "74px",
                            height: "20px",
                            border: "1px solid black",
                            borderRadius: "5px",
                            backgroundColor: "white",
                            color: "black",
                            fontFamily: "Arial",
                            fontSize: "16px",
                        },
                        onChange : (e) => {
                            this.setState({
                                stateInput : e.target.value,
                            })
                        },
                        value : this.state.stateInput,
                    }
                ),
                React.createElement("button", {
                        onClick: () => {
                            this.state.WS_CONNECTION.send(
                                this.constructMessage("setGrid", this.state.stateInput)
                            )
                        }
                    },
                    "set"
                ),
                React.createElement("button", {
                        onClick: () => {
                            this.state.WS_CONNECTION.send(
                                this.constructMessage("setGrid", (() => {
                                    let str = ""
                                    for (let i = 0; i < this.state.grid.rows; i++) {
                                        for (let j = 0; j < this.state.grid.cols; j++) {
                                            str += "0"
                                        }
                                    }
                                    return str
                                })())   
                            )
                        }
                    },
                    "reset"
                )
            ),
            this.state.grid ? React.createElement(
                "div", {
                    id: "grid",
                    style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(" + this.state.grid.cols + ", " + this.state.SQUARESIZE + "px)",
                        gridTemplateRows: "repeat(" + this.state.grid.rows + ", " + this.state.SQUARESIZE + "px)",
                        width: this.state.grid.cols * this.state.SQUARESIZE + "px",
                        height: this.state.grid.rows * this.state.SQUARESIZE + "px",
                        border: "1px solid black",
                        margin: "auto",
                        marginTop: "10px",
                        marginBottom: "10px",
                        backgroundColor: "white",
                        padding: "0px",
                        boxSizing: "border-box",
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: "5px",
                    },
                },
                gridElements
            ) : null
        );
    }
}