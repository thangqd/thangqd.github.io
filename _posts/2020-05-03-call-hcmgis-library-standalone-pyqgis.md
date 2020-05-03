---
title: Call HCMGIS Library in Standalone PyQGIS Application
tags: [HCMGIS Plugin, QGIS, Standalone PyQGIS]
style: 
color: success
description: How to call HCMGIS Library in Standalone PyQGIS Application.
---

***
### 1. Import HCMGIS library in Standalone PyQGIS Application:
##### In your PyGIS Application, simply copy hcmgis_library.py to your project folder and then import by **"from hcmgis_library import"**
##### If you don't want to copy hcmgis_library.py, just reference to it as below:

```python
from qgis.core import QgsApplication, QgsProcessingFeedback
from qgis.analysis import QgsNativeAlgorithms
QgsApplication.setPrefixPath(r'C:\OSGeo4W64\apps\qgis', True) # your QGIS Install Folder
qgs = QgsApplication([], False)
qgs.initQgis()
import sys
## Add the path to processing so we can import it next
sys.path.append(r'C:\OSGeo4W64\apps\qgis\python\plugins')
sys.path.append("C:\\Users\DELLG7\\AppData\\Roaming\\QGIS\\QGIS3\\profiles\\default\\python\\plugins\\HCMGIS") # Location of HCMGIS Plugin on your computer

from processing.core.Processing import Processing
Processing.initialize() # Beacause HCMGIS Plugin used some native QGIS algorithms in voronoi-related Sptial Processing tools
QgsApplication.processingRegistry().addProvider(QgsNativeAlgorithms())

# Import hcmgis_library
from hcmgis_library import *
```

### 2. List of HCMGIS Library Functions:
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

***
### 3. Call HCMGIS Library:
#### Reference:  [Call HCMGIS Plugin QGIS Python Console](https://hcmgis.github.io/blog/call-hcmgis-library-qgis-python-console)