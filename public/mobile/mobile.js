var args = {
    frequency:33,                   // ( How often the object sends the values - milliseconds )
    gravityNormalized:true,         // ( If the gravity related values to be normalized )
    orientationBase:GyroNorm.GAME,      // ( Can be GyroNorm.GAME or GyroNorm.WORLD. gn.GAME returns orientation values with respect to the head direction of the device. gn.WORLD returns the orientation values with respect to the actual north direction of the world. )
    decimalCount:3,                 // ( How many digits after the decimal point will there be in the return values )
    logger:null,                    // ( Function to be called to log messages from gyronorm.js )
    screenAdjusted:false            // ( If set to true it will return screen adjusted values. )
};

var gn = new GyroNorm();

gn.init(args).then(function(){
    gn.start(function(data){
    // Process:
    // data.do.alpha    ( deviceorientation event alpha value )
    // data.do.beta     ( deviceorientation event beta value )
    // data.do.gamma    ( deviceorientation event gamma value )
    // data.do.absolute ( deviceorientation event absolute value )

    // data.dm.x        ( devicemotion event acceleration x value )
    // data.dm.y        ( devicemotion event acceleration y value )
    // data.dm.z        ( devicemotion event acceleration z value )

    // data.dm.gx       ( devicemotion event accelerationIncludingGravity x value )
    // data.dm.gy       ( devicemotion event accelerationIncludingGravity y value )
    // data.dm.gz       ( devicemotion event accelerationIncludingGravity z value )

    // data.dm.alpha    ( devicemotion event rotationRate alpha value )
    // data.dm.beta     ( devicemotion event rotationRate beta value )
    // data.dm.gamma    ( devicemotion event rotationRate gamma value )

    	var accels = cell_to_earth(data.do.alpha, data.do.beta, data.do.gamma, data.dm.x, data.dm.y, data.dm.z);
        var details = {
            'orientation':{
                'alpha': data.do.alpha*Math.PI/180,
                'beta': data.do.beta*Math.PI/180,
                'gamma': data.do.gamma*Math.PI/180

            },
            'acceleration':{
                'x': accels.x,
                'y': accels.y,
                'z': accels.z
            },

            'id': document.getElementById("device_id").value
        };
        var xhr = new XMLHttpRequest();
        var url = "motion";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json");
        var tosend = JSON.stringify(details, ['orientation', 'acceleration', 'alpha', 'beta', 'gamma', 'x','y','z', 'id']);
        console.log(tosend)
        xhr.send(tosend);

    });
}).catch(function(e){
  // Catch if the DeviceOrientation or DeviceMotion is not supported by the browser or device
});

window.onclick=function(){
    gn.setHeadDirection();
}


let _x, _y, _z;
let cX, cY, cZ, sX, sY, sZ;
/*
 * return the rotation matrix corresponding to the orientation angles
 */
const cell_to_earth = function(alpha, beta, gamma,cellx,celly,cellz) {
	_z = alpha;
	_x = beta;
	_y = gamma;

	cX = Math.cos( _x );
	cY = Math.cos( _y );
	cZ = Math.cos( _z );
	sX = Math.sin( _x );
	sY = Math.sin( _y );
	sZ = Math.sin( _z );

	var mat_accel = math.matrix([[cellx], [celly], [cellz]]);
	var mat_earth_to_cell = math.matrix([
			[cZ * cY + sZ * sX * sY, - cY * sZ + cZ * sX * sY, cX * sY],
			[cX * sZ, cZ * cX, - sX],
			[- cZ * sY + sZ * sX * cY, sZ * sY + cZ * cY * sX, cX * cY]
		]
	)

	var accel_in_earth = math.multiply(math.inv(mat_earth_to_cell), mat_accel);
	return {
		x: math.subset(accel_in_earth, math.index(0, 0)), 
		y: math.subset(accel_in_earth, math.index(1, 0)), 
		z: math.subset(accel_in_earth, math.index(2, 0))     
	}  
};