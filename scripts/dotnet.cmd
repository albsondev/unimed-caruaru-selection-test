@echo off
setlocal

set "LOCAL_DOTNET=%~dp0..\.tools\dotnet\dotnet.exe"
set "DOTNET_CLI_HOME=%~dp0..\.dotnet-cli-home"
set "DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1"
set "DOTNET_NOLOGO=1"
set "DOTNET_CLI_TELEMETRY_OPTOUT=1"

if not exist "%DOTNET_CLI_HOME%" (
  mkdir "%DOTNET_CLI_HOME%" >nul 2>nul
)

if exist "%LOCAL_DOTNET%" (
  "%LOCAL_DOTNET%" %*
) else (
  dotnet %*
)
