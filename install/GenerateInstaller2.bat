del /s /q obj
del /s /q bin
"C:\Program Files (x86)\WiX Toolset v3.11\bin\heat.exe" dir "src\PQ Dashboard" -cg PQDashboardFiles -dr PQDASHFOLDER -gg -sfrag -srd -sreg -var var.PQDashSource -out src\DashComponents.wxs
"C:\Program Files (x86)\WiX Toolset v3.11\bin\heat.exe" dir "src\OpenSEE" -cg OpenSEEFiles -dr OPENSEEFOLDER -gg -sfrag -srd -sreg -var var.OpenSEESource -out src\OpenSEEComponents.wxs
"C:\Program Files (x86)\WiX Toolset v3.11\bin\heat.exe" dir "src\SEBrowser" -cg SEBrowserFiles -dr SEBROWSERFOLDER -gg -sfrag -srd -sreg -var var.SEBrowserSource -out src\SEBrowserComponents.wxs
"C:\Program Files (x86)\WiX Toolset v3.11\bin\candle.exe" src\PQDashboard2.wxs src\DashComponents.wxs src\OpenSEEComponents.wxs src\SEBrowserComponents.wxs "-dPQDashSource=src\PQ Dashboard" "-dOpenSEESource=src\OpenSEE" "-dSEBrowserSource=src\SEBrowser" -ext "C:\Program Files (x86)\WiX Toolset v3.11\bin\WixIIsExtension.dll" -ext "C:\Program Files (x86)\WiX Toolset v3.11\bin\WixNetFxExtension.dll" -ext "C:\Program Files (x86)\WiX Toolset v3.11\bin\WixUIExtension.dll" -ext "C:\Program Files (x86)\WiX Toolset v3.11\bin\WixUtilExtension.dll" -out obj\
"C:\Program Files (x86)\WiX Toolset v3.11\bin\light.exe" obj\PQDashboard2.wixobj obj\DashComponents.wixobj obj\OpenSEEComponents.wixobj obj\SEBrowserComponents.wixobj -ext "C:\Program Files (x86)\WiX Toolset v3.11\bin\WixIIsExtension.dll" -ext "C:\Program Files (x86)\WiX Toolset v3.11\bin\WixNetFxExtension.dll" -ext "C:\Program Files (x86)\WiX Toolset v3.11\bin\WixUIExtension.dll" -ext "C:\Program Files (x86)\WiX Toolset v3.11\bin\WixUtilExtension.dll" -out bin\PQDashboard2.msi