---
title: Call HCMGIS Library in QGIS Python Console
tags: [HCMGIS Plugin, QGIS]
style: 
color: warning
description: How to call HCMGIS Library in QGIS Console.
---

### 1. List of HCMGIS Library Functions:
```python
hcmgis_basemap_load()  
hcmgis_covid19()  
hcmgis_covid19_timeseries()  
hcmgis_covid19_vietnam()  
hcmgis_medialaxis(layer, field, density,output,status_callback = None)  
hcmgis_centerline(layer,density,chksurround,distance,output,status_callback = None)
hcmgis_closest_farthest(layer,field,closest,farthest,status_callback = None)
hcmgis_lec(layer,field,output,status_callback = None)
``` 

### 2. Import HCMGIS library
#### In QGIS Python console:  
```python
from HCMGIS.hcmgis_library import *
```



### 3. Call HCMGIS Library:
#### Add dozens of basemaps to XYZ Tiles of QGIS:
```python
hcmgis_basemap_load()
```
Result:</br>
![hcmgis_basemap_load](/assets/images/posts/2020/HCMGIS/basemap_load.png)

#### Download Global COVID-19 live update Data
```python
hcmgis_covid19()
```
![Global COVID-19](/assets/images/posts/2020/HCMGIS/global_covid19.png)


#### Download Global COVID-19 Timeseries Data
```python
hcmgis_covid19_timeseries()
```
![Global COVID-19 Timeseries](/assets/images/posts/2020/HCMGIS/global_covid19_timeseries.png)

#### Download Vietnam COVID-19 live update in Polygon
```python
hcmgis_covid19_vietnam()
```
![Vietnam COVID-19](/assets/images/posts/2020/HCMGIS/vietnam_covid19.png)

### Create Medial Axis/ Skeleton from Road in Polygon
```python
input = "D:\\osm\\road.shp" # your in put layer
output = "D:\\osm\\skeleton.shp" # your in put layer
hcmgis_medialaxis(input, 'OBJECTID', 1,output,status_callback = None) 
# hcmgis_medialaxis(layer, field, density,output,status_callback = None):
# layer: input layer
# field: unique field of input layer, in this case is 'OBJECTID'
# density (float value): densify geometries with a given interval (in this case the density is 1 meter). Smaller density value returns smoother centerline but slower
```