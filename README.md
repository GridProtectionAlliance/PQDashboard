# ![PQ Dashboard](http://www.gridprotectionalliance.org/images/products/PQDashboard.png)

**Open PQ Dashboard**

# Overview
A web based dashboard for system-wide visualization of power quality data contained in the [openXDA](https://github.com/GridProtectionAlliance/openXDA) data layer.

Open PQ Dashboard provides visual displays to quickly convey the status and location of power quality (PQ) anomalies throughout the electrical power system. Summary displays start with the choice of a geospatial map-view or annunciator panel, both with unique visualizations for across-the-room viewing fit for a PQ operations center. Drill-downs are in place for various statistics and guide users all the way down to the waveform level. This version consists of a few proof-of-concept applications of applying event severity and trend values to heatmap displays—giving the PQ engineers a wide-area status of PQ for quick interpretation. Data quality has been added so users can quickly see when meters are providing incomplete or invalid data. This dashboard currently accepts power quality data from COMTRADE and PQDIF standard file formats, E-Max Instruments native file format, and some SEL native .eve files from a limited number of relay models. Additional input file formats can be added as new projects require them. See the installation manual for more details.

**PQ Dashboard Screen:**
![PQ Dashboard Screen](http://www.gridprotectionalliance.org/images/products/PQDashboard collage2.jpg)

**Where Open PQ Dashboard Fits in:**
![Where it fits in](https://raw.githubusercontent.com/GridProtectionAlliance/PQDashboard/master/readme%20files/where%20it%20fits%20in.png)

# Documentation and Support

* The PQ Dashboard's manual can be found [here](https://github.com/GridProtectionAlliance/PQDashboard/blob/master/Open%20PQ%20Dashboard%20v1.0%20Manual.pdf)
* Get in contact with our development team on our [discussion board](http://discussions.gridprotectionalliance.org/c/gpa-products/pqdashboard).
* Check out the [wiki](https://gridprotectionalliance.org/wiki/doku.php?id=pqdashboard:overview).

# Deployment

1. Make sure your system meets all the [requirements](#requirements) below.
* [Download](#downloads) a version below.
* Unzip if necessary.
* Run "PQDashboard.msi".
* Follow the wizard.
* Enjoy.

## Requirements
### Operating System
* 64-bit Windows 7 or Windows Server 2008 R2 (or newer).

### Minimum Hardware
* 2.0 GHz CPU.
* 2.0 GB RAM.
* 50 GB of available disk space for installation and testing. Operational disk space requirements will be proportional to the volume of input data.

### Software
* [openXDA](https://github.com/GridProtectionAlliance/openXDA).
* .NET 3.5 SP1 (required by SQL Server 2012).
* .NET 4.6.
* SQL Server 2012 with management tools.
  * Free Express version is fine, but has a 10GB limit.
  * Mixed mode authentication must be enable on the SQL Server.
* IIS web server.
  * ASP.NET 4.6.
  * Windows Authentication.
* Highcharts v4.0.4.
* jQWidgets 3.6.0 or newer.
* [openHistorian 2.0](https://github.com/GridProtectionAlliance/openHistorian).
* Compatible browsers:
  * Internet Explorer 11.
  * Google Chrome.
  * Mozilla Firefox.

## Downloads
* Version 1.0 of the Open PQ Dashboard is available on SourceForge as [*EPRI Open PQ Dashboard*](https://sourceforge.net/projects/epriopenpqdashboard/).
* For later releases check the [releases](https://github.com/GridProtectionAlliance/PQDashboard/releases) page.

# Contributing
If you would like to contribute please:

1. Read our [styleguide.](https://www.gridprotectionalliance.org/docs/GPA_Coding_Guidelines_2011_03.pdf)
* Fork the repository.
* Work your magic.
* Create a pull request.
