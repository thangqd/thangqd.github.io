---
title: QGIS Server Installation on Windows
tags: [QGIS Server]
style: 
color: danger
description: How to istall QGIS Server on Windows.
---

***
### 1. Install QGIS Server
#### - [Download OSGeo4W](https://trac.osgeo.org/osgeo4w/)  
#### - Run OSGe4W with Advanced Install option  
![OSGeo4W](/assets/images/posts/2020/QGISServer/osgeo4w.png)
#### - Search and choose qgis-server to install  
![QGIS Server](/assets/images/posts/2020/QGISServer/qgisserver.png)
#### - Install Apache as Web Server for QGIS Server: Download the [XAMPP installer](https://www.apachefriends.org/download.html) for Windows and install Apache  
![Apache Install](/assets/images/posts/2020/QGISServer/apache.png)
#### - Configure Apache to run QGIS Server:  
##### - Edit the httpd.conf file (C:\xampp\apache\httpd.conf)  and make the following changes:
From:  
`ScriptAlias /cgi-bin/ "C:/xampp/cgi-bin/"`  
To:  
`ScriptAlias /cgi-bin/ "c:/OSGeo4W64/apps/qgis/bin/"`  

From:  
`<Directory "C:/xampp/cgi-bin">
AllowOverride None  
Options None  
Require all granted  
</Directory>`   
To:    
`<Directory "c:/OSGeo4W64/apps/qgis/bin">  
SetHandler cgi-script  
AllowOverride None  
Options ExecCGI    
Order allow,deny  
Allow from all  
Require all granted  
</Directory>`  

From:  
`AddHandler cgi-script .cgi .pl .asp`  
To:  
`AddHandler cgi-script .cgi .pl .asp .exe  `  
Then at the bottom of httpd.conf, add:  
`SetEnv GDAL_DATA "C:\OSGeo4W64\share\gdal"  
SetEnv QGIS_AUTH_DB_DIR_PATH "C:\OSGeo4W64\apps\qgis\resources"  
SetEnv PYTHONHOME "C:\OSGeo4W64\apps\Python37"  
SetEnv PATH "C:\OSGeo4W64\bin;C:\OSGeo4W64\apps\qgis\bin;C:\OSGeo4W64\apps\Qt5\bin;C:\WINDOWS\system32;C:\WINDOWS;  C:\WINDOWS\System32\Wbem"  
SetEnv QGIS_PREFIX_PATH "C:\OSGeo4W64\apps\qgis"  
SetEnv QT_PLUGIN_PATH "C:\OSGeo4W64\apps\qgis\qtplugins;C:\OSGeo4W64\apps\Qt5\plugins"`  
##### - Restart the Apache web server from the XAMPP Control Panel 
![Apache Restart](/assets/images/posts/2020/QGISServer/startapache.png)
##### -	Open Web browser to testing a GetCapabilities request to QGIS Server:
`http://localhost/cgi-bin/qgis_mapserv.fcgi.exe?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities`  
![GetCapabilities](/assets/images/posts/2020/QGISServer/getcapabilities.png)  
### 2. Publish maps to QGIS Server from a QGIS Project  
#### - Download [demo data](https://github.com/qgis/QGIS-Training-Data/archive/v2.0.zip), unzip the files in the qgis-server-tutorial-data  
#### - Open world.qgs or (world3.qgs) and Save as Project to QGIS bin folder `(C:\OSGeo4W64\apps\qgis\bin)`  
![QGIS Project](/assets/images/posts/2020/QGISServer/qgisproject.png)  
#### -	There are 4 layers in the world.qgs project:
    o airports
    o places
    o countries
    o countries_shapeburst
#### - Configure WMS, WMTS and WFS: menu Project --> Properties --> QGIS Server:
![Configure QGIS Server](/assets/images/posts/2020/QGISServer/configureqgisserver.png)  

### 3. Test QGIS Server:
### WMS
#### GetCapabilities:
`http://localhost/cgi-bin/qgis_mapserv.fcgi.exe?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities&map=world.qgs`  
![Get Capabilities of world map](/assets/images/posts/2020/QGISServer/getcapabilities2.png)  

#### GetPorjectSetting
`http://localhost/cgi-bin/qgis_mapserv.fcgi.exe?MAP=world.qgs&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetProjectSettings`  
![Get Project Setting](/assets/images/posts/2020/QGISServer/getprojectsetting.png)  

#### GetMap
`http://localhost/cgi-bin/qgis_mapserv.fcgi.exe?MAP=world.qgs&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&BBOX=10208324, 949379, 13572097, 2661355&SRS=EPSG:3857&WIDTH=665&HEIGHT=551&LAYERS=countries&FORMAT=image/jpeg`  
![Get Map](/assets/images/posts/2020/QGISServer/getmap.png)  

#### Filter and Opacity
`http://localhost/cgi-bin/qgis_mapserv.fcgi.exe?MAP=world.qgs&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&BBOX=-432786,4372992,3358959,7513746&SRS=EPSG:3857&WIDTH=665&HEIGHT=551&FORMAT=image/jpeg&LAYERS=countries,countries_shapeburst&STYLES=classified_by_name,blue&OPACITIES=255,30&FILTER=”countries:\”name\” IN ('Germany','Italy')”`  
![Filter and Opacity](/assets/images/posts/2020/QGISServer/filterandopacity.png)  


#### Use Redlining
`http://localhost/cgi-bin/qgis_mapserv.fcgi.exe?MAP=world.qgs&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&BBOX=-432786,4372992,3358959,7513746&SRS=EPSG:3857&WIDTH=665&HEIGHT=551&LAYERS=countries,countries_shapeburst&FORMAT=image/jpeg&HIGHLIGHT_GEOM=POLYGON((590000 6900000, 590000 7363000, 2500000 7363000, 2500000 6900000, 590000 6900000))&HIGHLIGHT_SYMBOL=<StyledLayerDescriptor><UserStyle><Name>Highlight</Name><FeatureTypeStyle><Rule><Name>Symbol</Name><LineSymbolizer><Stroke><SvgParameter ame="stroke">%233a093a</SvgParameter><SvgParameter name="stroke-opacity">1</SvgParameter><SvgParameter name="stroke-width">1.6</SvgParameter></Stroke></LineSymbolizer></Rule></FeatureTypeStyle></UserStyle></StyledLayerDescriptor>&HIGHLIGHT_LABELSTRING=QGIS Tutorial&HIGHLIGHT_LABELSIZE=30&HIGHLIGHT_LABELCOLOR=%23000000&HIGHLIGHT_LABELBUFFERCOLOR=%23FFFFFF&HIGHLIGHT_LABELBUFFERSIZE=3&SELECTION=countries:171,65`  

![Use Redlining](/assets/images/posts/2020/QGISServer/redlining.png)  

#### GetPrint
`http://localhost/cgi-bin/qgis_mapserv.fcgi.exe?map=world.qgs&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetPrint&FORMAT=pdf&TRANSPARENT=true&SRS=EPSG:3857&DPI=300&TEMPLATE=Population distribution&map0:extent=-2786,4372992,3358959,7513746&LAYERS=countries`  
![Get Print](/assets/images/posts/2020/QGISServer/getprint.png)  


#### WFS GetFeature
`http://localhost/cgi-bin/qgis_mapserv.fcgi.exe?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=countries&map=world.qgs` 
![WFS GetFeature](/assets/images/posts/2020/QGISServer/wfsgetfeature.png)  


#### WMTS:
`http://localhost/cgi-bin/qgis_mapserv.fcgi.exe?SERVICE=WMTS&REQUEST=GetTile&MAP=world.qgs&LAYER=countries&FORMAT=image/png&TILEMATRIXSET=EPSG:3857&TileMatrix=0&TILEROW=0&TILECOL=0` 
![WMTS](/assets/images/posts/2020/QGISServer/wmts.png)  

#### Add WFS in QGIS Python Console:
```python
url = 'http://localhost/cgi-bin/qgis_mapserv.fcgi.exe?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=countries&map=world.qgs'
qgis.utils.iface.addVectorLayer(url,'qgisserverwfs','WFS')  
```  
![Add WFS in QGIS Python Console](/assets/images/posts/2020/QGISServer/wfsqgis.png)  






 