---
title: Call HCMGIS Library in QGIS Python Console
tags: [HCMGIS Plugin, QGIS]
style: 
color: warning
description: How to call HCMGIS Library in QGIS Console.
---
### 1. Import HCMGIS library
#### In QGIS Python console:  

```python
from HCMGIS.hcmgis_library import *
```
### 2. Call HCMGIS Library:
#### Add dozens of basemaps to XYZ Tiles of QGIS:
```python
hcmgis_basemap_load()
```
![hcmgis_basemap_load](/assets/images/posts/2020/HCMGIS/basemap_load.png)
![hcmgis_basemap_load](./assets/images/projects/opendata.png)

#### Download Global COVID-19 live update Data
```python
hcmgis_covid19()
```
#### Download Global COVID-19 Timeseries Data
```python
hcmgis_covid19_timeseries()
```
#### Download Vietnam COVID-19 live update in Polygon
```python
hcmgis_covid19_vietnam()
```