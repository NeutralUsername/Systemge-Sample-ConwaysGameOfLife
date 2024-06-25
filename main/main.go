package main

import (
	"Systemge/Client"
	"Systemge/Module"
	"Systemge/Utilities"
	"SystemgeSampleConwaysGameOfLife/appGameOfLife"
	"SystemgeSampleConwaysGameOfLife/appWebsocketHTTP"
)

const RESOLVER_ADDRESS = "127.0.0.1:60000"
const RESOLVER_NAME_INDICATION = "127.0.0.1"
const RESOLVER_TLS_CERT_PATH = "MyCertificate.crt"
const WEBSOCKET_PORT = ":8443"
const HTTP_PORT = ":8080"

const ERROR_LOG_FILE_PATH = "error.log"

func main() {
	clientGameOfLife := Module.NewClient(&Client.Config{
		Name:                       "clientGameOfLife",
		ResolverAddress:            RESOLVER_ADDRESS,
		ResolverNameIndication:     RESOLVER_NAME_INDICATION,
		ResolverTLSCert:            Utilities.GetFileContent(RESOLVER_TLS_CERT_PATH),
		LoggerPath:                 ERROR_LOG_FILE_PATH,
		HandleMessagesConcurrently: true,
	}, appGameOfLife.New(), nil, nil)
	applicationWebsocketHTTP := appWebsocketHTTP.New()
	clientWebsocketHTTP := Module.NewClient(&Client.Config{
		Name:                       "clientWebsocketHTTP",
		ResolverAddress:            RESOLVER_ADDRESS,
		ResolverNameIndication:     RESOLVER_NAME_INDICATION,
		ResolverTLSCert:            Utilities.GetFileContent(RESOLVER_TLS_CERT_PATH),
		LoggerPath:                 ERROR_LOG_FILE_PATH,
		WebsocketPattern:           "/ws",
		WebsocketPort:              WEBSOCKET_PORT,
		HTTPPort:                   HTTP_PORT,
		HandleMessagesConcurrently: true,
	}, applicationWebsocketHTTP, applicationWebsocketHTTP, applicationWebsocketHTTP)
	Module.StartCommandLineInterface(Module.NewMultiModule(
		Module.NewResolverFromConfig("resolver.systemge", ERROR_LOG_FILE_PATH),
		Module.NewBrokerFromConfig("brokerGameOfLife.systemge", ERROR_LOG_FILE_PATH),
		Module.NewBrokerFromConfig("brokerWebsocket.systemge", ERROR_LOG_FILE_PATH),
		clientGameOfLife,
		clientWebsocketHTTP,
	))
}
