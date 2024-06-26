package appGameOfLife

import (
	"Systemge/Config"
	"Systemge/Node"
	"Systemge/Resolution"
	"Systemge/Utilities"
	"sync"
)

type App struct {
	randomizer *Utilities.Randomizer
	grid       [][]int
	mutex      sync.Mutex
	gridRows   int
	gridCols   int
	toroidal   bool
}

func New() *App {
	app := &App{
		randomizer: Utilities.NewRandomizer(Utilities.GetSystemTime()),

		grid:     nil,
		gridRows: 90,
		gridCols: 140,
		toroidal: true,
	}
	return app
}

func (app *App) OnStart(node *Node.Node) error {
	grid := make([][]int, app.gridRows)
	for i := range grid {
		grid[i] = make([]int, app.gridCols)
	}
	app.grid = grid
	return nil
}

func (app *App) OnStop(node *Node.Node) error {
	return nil
}

func (app *App) GetApplicationConfig() Config.Application {
	return Config.Application{
		ResolverResolution:         Resolution.New("resolver", "127.0.0.1:60000", "127.0.0.1", Utilities.GetFileContent("MyCertificate.crt")),
		HandleMessagesSequentially: false,
	}
}
