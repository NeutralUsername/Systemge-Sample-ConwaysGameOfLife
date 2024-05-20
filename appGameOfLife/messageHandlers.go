package appGameOfLife

import (
	"Systemge/Error"
	"Systemge/Message"
	"Systemge/Utilities"
)

func (app *App) GetMessageHandlersSync() map[string]func(*Message.Message) (string, error) {
	return map[string]func(*Message.Message) (string, error){
		"getGridSync": func(message *Message.Message) (string, error) {
			app.mutex.Lock()
			defer app.mutex.Unlock()
			return NewGrid(app.grid).Marshal(), nil
		},
	}
}

func (app *App) GetMessageHandlersAsync() map[string]func(*Message.Message) error {
	return map[string]func(*Message.Message) error{
		"gridChange": func(message *Message.Message) error {
			app.mutex.Lock()
			defer app.mutex.Unlock()
			gridChange := UnmarshalGridChange(message.Body)
			app.grid[gridChange.Row][gridChange.Column] = gridChange.State
			app.messageBrokerClient.AsyncMessage(Message.New("getGridChange", app.name, "", gridChange.Marshal()))
			return nil
		},
		"nextGeneration": func(message *Message.Message) error {
			app.mutex.Lock()
			defer app.mutex.Unlock()
			app.calcNextGeneration()
			err := app.messageBrokerClient.AsyncMessage(Message.New("getGrid", app.name, "", NewGrid(app.grid).Marshal()))
			if err != nil {
				app.logger.Log(Error.New(err.Error()).Error())
			}
			return nil
		},
		"setGrid": func(message *Message.Message) error {
			app.mutex.Lock()
			defer app.mutex.Unlock()
			if len(message.Body) != GRIDCOLS*GRIDROWS {
				return Error.New("Invalid grid size")
			}
			for row := 0; row < GRIDROWS; row++ {
				for col := 0; col < GRIDCOLS; col++ {
					app.grid[row][col] = Utilities.StringToInt(string(message.Body[row*GRIDCOLS+col]))
				}
			}
			err := app.messageBrokerClient.AsyncMessage(Message.New("getGrid", app.name, "", NewGrid(app.grid).Marshal()))
			if err != nil {
				app.logger.Log(Error.New(err.Error()).Error())
			}
			return nil
		},
	}
}
