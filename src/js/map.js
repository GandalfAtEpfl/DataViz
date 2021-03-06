/*global L
global d3
global GENRES
Js Scirpt for Data visualisation Projet : Evolution of Rock Music
Autor : Benjamin Girard / Paul Feng / Olga Popovych

This file is use to draw the map 

*/

/*var tile = new L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});
*/
//layer with tile dark 
var tiledqrk = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

//orig new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")

//the map
var map = new L.Map("maps", {minZoom:1.7,/*maxBounds:[
    [-180, 0],
    [180, 180]
],*/zoomControl:false, attributionControl: false , center: [ 30.519962, 6.633597], zoom: 2}).addLayer(tiledqrk  );

//Build for once the icone use by the map
build_icone();


//add zoom control to the ritght
L.control.zoom({
     position:'topright'
}).addTo(map);

//http://leaflet-extras.github.io/leaflet-providers/preview/
/*fetch("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json")
  .then(function(response) { return response.json(); })
  .then(function(data) {L.geoJSON(data).addTo(map)});*/


//PErsonalized cluster to show cricle with size propotional to the number of sont in each cluster
var ArtistCluster = new PruneClusterForLeaflet(250,150);
ArtistCluster.BuildLeafletClusterIcon = function(cluster) {
            var e = new L.Icon.MarkerCluster();

            //e.on('click', function() {});
            e.stats = cluster.stats;
            e.population = cluster.population;
            return e;
};
//use our icone
ArtistCluster.BuildLeafletCluster =  function (cluster, position) {
        var _this = this;
        var m = new L.Marker(position, {
            icon: this.BuildLeafletClusterIcon(cluster)
        });
        m._leafletClusterBounds = cluster.bounds;
        //m.bindPopup("        ");
       /* m.on('click', function () {      
            
            //m.icon = 
            
        });*/
        return m;
    }


map.addLayer(ArtistCluster);


//var ArtistCluster =  L.featureGroup() ;


//built the icone 
function build_icone()
{
    ICONES = [];
    for(let icon_name of ICONE_NAMES)
    {

         var Icon = new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/GandalfAtEpfl/DataViz/master/src/icons/'+ icon_name +'.png',
            // shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [41, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              //shadowSize: [41, 41]
        })

    ICONES.push(Icon)
    }

}

//Cretate all the marker for once
function build_marker()
{

    // at start SelectToShow will return all song that we want studie
    for(var element of SelectToShow())
    {

            let index_genre = GENRES.indexOf(element[6][0]);
            var color =  COLOR[index_genre];
            
            
            //if tho marker are on the same spot place it in circle
            let angle = 2*Math.PI*Math.random()
            element["marker"] = new PruneCluster.Marker(element[1]+Math.cos(angle)/40.0, element[2]+Math.sin(angle)/40.0);//,{color:color}) // L.marker( [element[1], element[2]] , {icon: greenIcon});


            element["marker"].data.icon = ICONES[index_genre];  // See http://leafletjs.com/reference.html#icon
            element["marker"].data.popup = 'Year : '+element[0]+'<br/>Artist Name: '+element[4]+' <br/> Tittle: '+element[7]+'<br/> GENRE : '+element[6][0]+' <br/> hotness : '+element[3]+'/'+element[8];

            element["marker"].category = index_genre ;
            element["marker"].weight = 4;
            ArtistCluster.RegisterMarker(element["marker"]);

            //console.log("MARKER  :"+[element[1], element[2]])
            /*let angle = 0///360.0*Math.random()
            element["marker"] = L.circle([element[1]+Math.cos(angle)/20, element[2]+Math.sin(angle)/20], {radius: 200,color:color,fillColor:color,fill:true,fillOpacity: 1.0})
            element["marker"].bindPopup('Year : '+element[0]+'<br/>Artist Name: '+element[4]+' <br/> Tittle: '+element[7]+'<br/> GENRE : '+element[6][0]+' <br/> hotness : '+element[3]+'/'+element[8])
            element["marker"].addTo(ArtistCluster);*/

    }


}

//hide the marker that was unselded by the user
function updatemap()
{

    var t = timer("SELECT");
    var data = SelectToShow();

    //ArtistCluster.remove();
    //ArtistCluster = L.featureGroup()
    
    //filter all marker
    for(var element of DATA.data)
    {
        if(element['marker'] != undefined )
        {
            element['marker'].filtered = true;
        }
       // element['marker'].opacity  = 0 ;

    }

    //and add only the marker selected

    for(var element of data)
    {

    //console.log("add"  + element['marker'] )
        //Artist.addLayer( element['marker'] );
        element['marker'].filtered = false;
        //console.log("MARKER  :"+[element[1], element[2]])

         //element["marker"].addTo(ArtistCluster);
        //element['marker'].opacity  = 1 ;
         //element['marker'].redraw()
    }
    ArtistCluster.ProcessView();
    //Artist.addTo(map);

    //ArtistCluster.addTo(map)
    t.stop()
}



//here we build our special icone for cluster
var colors = COLOR; // ['#ff4b00', '#bac900', '#EC1813', '#55BCBE', '#D2204C', '#FF0000', '#ada59a', '#3e647e'],
        pi2 = Math.PI * 2;

    L.Icon.MarkerCluster = L.Icon.extend({
        options: {
           // iconSize: new L.Point(150, 100),
            className: 'prunecluster leaflet-markercluster-icon'
        },
        
        

        createIcon: function () {
              var maxr = 0;
              var nbr = 0;
              const r = 30/10;//constante for the rayon
              const minr = 10;//rayon minimal to see cluster
              
              // first we calcul the rayon on the most genre in this cluster
              for (var i = 0; i <  colors.length; ++i) {

                  if(this.stats[i]>0)
                    nbr+=1;//count the non empty genre
                  let percent = Math.log(this.stats[i])*r;
                  if(percent>maxr)
                    maxr=percent;
              }
              //minimal rayon
              maxr = Math.max(minr,maxr);

            let sx=0;
            let sy=1;
            //compute the size of the grid !!! 
            while(sx*sy<nbr)
            {
                if(sy+1<=sx)
                sy+=1;
                else
                sx+=1;
            }
            
            
            //console.log(maxr,sx,sy)
            
            // the icone size is : 
            // Size grid mutiply by max size of each dot 
            this.options.iconSize = new L.Point(2*maxr*sx+maxr, 2*maxr*sy+maxr);


            var e = document.createElement('canvas');
            this._setIconStyles(e, 'icon');
            var s = this.options.iconSize;
            e.width = s.x;
            e.height = s.y;
            this.draw(e.getContext('2d'), maxr,sx,sy,r);
            return e;
        },

        createShadow: function () {
            return null;
        },

        draw: function(canvas,maxr,sx,sy,r) {


            var start = 0;
            for (var i = 0,j=0; i <  colors.length; ++i) {
                // for each genre:
                if(this.stats[i]==0 || !this.stats[i])//if not null
                    continue;

                // compute the rayon r is a constante
                var rayon = Math.log(this.stats[i])*r;
                rayon = Math.max(10,rayon);
                var x =  j%sx*2*maxr+maxr+5;//place this circle on the grid
                var y =  Math.floor(j/sx)*2*maxr+maxr+5;
                    
                    //draw the circle 

                    canvas.beginPath();
                    canvas.fillStyle = COLOR[i];
                    canvas.arc(x, y, rayon, 0, Math.PI*2);
                    canvas.fill();
                    canvas.closePath();

                    canvas.fillStyle = '#FFFFFF';
                    canvas.textAlign = 'center';
                    canvas.textBaseline = 'middle';
                    canvas.font = 'bold 12px sans-serif';

                    canvas.fillText(this.stats[i], x, y, 2*maxr-5);
                    j+=1;
            }


        }
    });
