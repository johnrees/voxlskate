(function() {
  var canvas;

  canvas = document.getElementById('2d');

  canvas.setAttribute('width', window.innerWidth / 2);

  canvas.setAttribute('height', window.innerHeight);

}).call(this);
(function() {
  var canvas, resize;

  resize = function() {
    canvas.setAttribute('width', window.innerWidth / 2);
    return canvas.setAttribute('height', window.innerHeight);
  };

  canvas = document.getElementById('3d');

  resize();

}).call(this);
window.onload= function() {

  var stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.right = '4px';
  stats.domElement.style.top = '4px';
  stats.begin();
  document.body.appendChild( stats.domElement );

  var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('3d')})

  var myImgElement = document.getElementById('image')
  var w = myImgElement.width, h=myImgElement.height

  var canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  var ctx = canvas.getContext('2d')
  ctx.drawImage( myImgElement, 0, 0 )

  var imgdata = ctx.getImageData(0,0,w,h);
  var rgba = imgdata.data;

  var deckgeometry = new THREE.PlaneGeometry(w/2, h/2, w-1, h-1);
  var count = 0;

  var materials = [
    new THREE.MeshNormalMaterial({color: 0xFFFFFF, side: THREE.DoubleSide, wireframe: false, shading: THREE.NoShading }),
    // new THREE.MeshBasicMaterial({color: 0x222222, side: THREE.DoubleSide, wireframe: false, shading: THREE.NoShading }),
    new THREE.MeshBasicMaterial({visible: false})
  ]

  for (var y=0; y < h; y+=1) {
    for (var x=0; x < w; x+=1) {
      var a = rgba[count*4];
      deckgeometry.vertices[count].z = parseFloat((a/10).toFixed(1));
      count++;
    }
  }

  for (var v=0; v < deckgeometry.faces.length; v+=1) {
    var f = deckgeometry.faces[v];
    f.materialIndex = (deckgeometry.vertices[f.a].z < 1 || deckgeometry.vertices[f.b].z < 1 || deckgeometry.vertices[f.c].z < 1) ? 1 : 0;
  }


  var scene = new THREE.Scene();
  var axes = new THREE.AxisHelper(500)
  scene.add(axes)
  var camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 1000 );
  controls = new THREE.TrackballControls(camera, renderer.domElement)
  controls.maxDistance = 400
  controls.minDistance = 50

  renderer.setSize( window.innerWidth/2, window.innerHeight/2 )
  renderer.setClearColor( 0xffffff, 1)
  // document.body.appendChild( renderer.domElement )

  camera.position.z = 200;

  deckgeometry.mergeVertices()
  deckgeometry.computeFaceNormals(true)
  deckgeometry.computeVertexNormals()
  deckgeometry.center()

  var deck = new THREE.Mesh( deckgeometry, new THREE.MeshFaceMaterial(materials) );
  scene.add(deck);

  // deck.rotation.z = .3;
  // deck.rotation.x = -.7;
  // deck.rotation.y = .1;

  var render = function () {
    stats.end();
    requestAnimationFrame( render );
    controls.update();
    renderer.render(scene, camera);
  };

  render();

}
;
window.point = null;

(function() {

  var canvas, ctx, code, ploint, style, drag = null, dploint, button, ta, undo, history;

  ta = document.getElementById('loader');
  undo = document.getElementById('undo');
  history = [];

  // define initial ploints
  function Init(quadratic) {

    ploint = {
      p1: { x:150, y:170, show: true },
      p2: { x:700, y:170, show: true },
      p3: { x:700, y:320 },
      p4: { x:150, y:320 },
    };

    if (quadratic) {
      ploint.cp1 = { x: 50, y: 225 };
    }
    else {
      ploint.cp1a = { x: 20, y: 170, show: true };
      ploint.cp1b = { x: 280, y: 170, show: true };
      ploint.cp2a = { x: 570, y: 170, show: true };
      ploint.cp2b = { x: 830, y: 170, show: true };

      ploint.cp3a = { x: 570, y: 320 };
      ploint.cp3b = { x: 830, y: 320 };
      ploint.cp4a = { x: 20, y: 320 };
      ploint.cp4b = { x: 280, y: 320 };
    }

    history.push(JSON.stringify(ploint));

    // default styles
    style = {
      curve:  { width: 3, color: "#000" },
      cpline: { width: 1, color: "rgba(0,0,255,0.4)" },
      ploint: { radius: 11, width: 1, color: "rgba(0,0,255,0.4)", fill: "rgba(0,0,255,0.15)", arc1: 0, arc2: 2 * Math.PI }
    }

    // line style defaults
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    button = document.getElementById('load');
    button.onmouseup = loadData;
    undo.onmouseup = undoData;
    // event handlers
    canvas.onmousedown = DragStart;
    canvas.onmousemove = Dragging;
    canvas.onmouseup = canvas.onmouseout = DragEnd;

    DrawCanvas();
  }

  function undoData() {
    console.log(history);
    if (history.length > 1) {
      history.pop();
      ploint = JSON.parse(history[history.length-1]);
    }
    DrawCanvas();
  }

  function loadData() {
    ploint = JSON.parse(ta.value);
    DrawCanvas();
    var p = JSON.stringify(ploint);
    if (history[history.length-1] != p) {
      history.push(p);
    }
  }


  // draw canvas
  function DrawCanvas() {

    window.point = ploint;

    console.log(window.point.cp2b.x);

    ctx.clearRect(0, 0, canvas.width, canvas.height);


    ctx.lineWidth = style.cpline.width;
    ctx.strokeStyle = style.cpline.color;
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();

    // control lines
    ctx.lineWidth = style.cpline.width;
    ctx.strokeStyle = style.cpline.color;

    // ctx.moveTo(170, 220);
    ctx.beginPath();
    ctx.arc(170,225,5,0,2 * Math.PI, false);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(170,265,5,0,2 * Math.PI, false);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(210,225,5,0,2 * Math.PI, false);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(210,265,5,0,2 * Math.PI, false);
    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(50, 20);
    ctx.lineTo(50, 800);

    ctx.moveTo(170, 20);
    ctx.lineTo(170, 800);

    ctx.moveTo(680, 20);
    ctx.lineTo(680, 800);

    ctx.moveTo(800, 20);
    ctx.lineTo(800, 800);

    ctx.moveTo(0, 245);
    ctx.lineTo(950, 245);

    ctx.moveTo(ploint.p1.x, ploint.p1.y);
    ctx.lineTo(ploint.cp1a.x, ploint.cp1a.y);
    ctx.moveTo(ploint.p1.x, ploint.p1.y);
    ctx.lineTo(ploint.cp1b.x, ploint.cp1b.y);
    if (ploint.cp2a) {
      ctx.moveTo(ploint.p2.x, ploint.p2.y);
      ctx.lineTo(ploint.cp2a.x, ploint.cp2a.y);
      ctx.moveTo(ploint.p2.x, ploint.p2.y);
      ctx.lineTo(ploint.cp2b.x, ploint.cp2b.y);
      // ctx.moveTo(ploint.p3.x, ploint.p3.y);
      // ctx.lineTo(ploint.cp3a.x, ploint.cp3a.y);
      // ctx.moveTo(ploint.p3.x, ploint.p3.y);
      // ctx.lineTo(ploint.cp3b.x, ploint.cp3b.y);

      // ctx.moveTo(ploint.p4.x, ploint.p4.y);
      // ctx.lineTo(ploint.cp4a.x, ploint.cp4a.y);
      // ctx.moveTo(ploint.p4.x, ploint.p4.y);
      // ctx.lineTo(ploint.cp4b.x, ploint.cp4b.y);

    }
    else {
      ctx.lineTo(ploint.p2.x, ploint.p2.y);
    }
    ctx.stroke();

    // curve
    ctx.lineWidth = style.curve.width;
    ctx.strokeStyle = style.curve.color;
    ctx.beginPath();

    ctx.moveTo(ploint.p1.x, ploint.p1.y);
    // if (ploint.cp2a) {
      ctx.bezierCurveTo(ploint.cp1b.x, ploint.cp1b.y, ploint.cp2a.x, ploint.cp2a.y, ploint.p2.x, ploint.p2.y);
      ctx.bezierCurveTo(ploint.cp2b.x, ploint.cp2b.y, ploint.cp3b.x, ploint.cp3b.y, ploint.p3.x, ploint.p3.y);
      ctx.bezierCurveTo(ploint.cp3a.x, ploint.cp3a.y, ploint.cp4b.x, ploint.cp4b.y, ploint.p4.x, ploint.p4.y);
      ctx.bezierCurveTo(ploint.cp4a.x, ploint.cp4a.y, ploint.cp1a.x, ploint.cp1a.y, ploint.p1.x, ploint.p1.y);

      // console.log('ctx.moveTo', ploint.p1.x/10, ploint.p1.y/10);
      // console.log('ctx.bezierCurveTo', ploint.cp1b.x/10, ploint.cp1b.y/10, ploint.cp2a.x/10, ploint.cp2a.y/10, ploint.p2.x/10, ploint.p2.y/10);
      // console.log('ctx.bezierCurveTo', ploint.cp2b.x/10, ploint.cp2b.y/10, ploint.cp3b.x/10, ploint.cp3b.y/10, ploint.p3.x/10, ploint.p3.y/10);
      // console.log('ctx.bezierCurveTo', ploint.cp3a.x/10, ploint.cp3a.y/10, ploint.cp4b.x/10, ploint.cp4b.y/10, ploint.p4.x/10, ploint.p4.y/10);
      // console.log('ctx.bezierCurveTo', ploint.cp4a.x/10, ploint.cp4a.y/10, ploint.cp1a.x/10, ploint.cp1a.y/10, ploint.p1.x/10, ploint.p1.y/10);
    // }
    // else {
    //   ctx.quadraticCurveTo(ploint.cp1.x, ploint.cp1.y, ploint.p2.x, ploint.p2.y);
    // }
    ctx.stroke();

    // control ploints
    for (var p in ploint) {
      // if (["p1","p2","cp1a","cp1b","cp2a","cp2b"].indexOf(p) > -1) {
      if (ploint[p].y <= 245) {
        ctx.lineWidth = style.ploint.width;
        ctx.strokeStyle = style.ploint.color;
        ctx.fillStyle = style.ploint.fill;
        ctx.beginPath();
        ctx.arc(ploint[p].x, ploint[p].y, style.ploint.radius, style.ploint.arc1, style.ploint.arc2, true);
        ctx.fill();
        ctx.stroke();
      }
    }

    ShowCode();
  }


  // show canvas code
  function ShowCode() {
    ta.value = JSON.stringify(ploint);
  }


  // start dragging
  function DragStart(e) {
    e = MousePos(e);

      var dx, dy;
      for (var p in ploint) {
        dx = ploint[p].x - e.x;
        dy = ploint[p].y - e.y;
        if ((dx * dx) + (dy * dy) < style.ploint.radius * style.ploint.radius) {
          drag = p;
          dploint = e;
          canvas.style.cursor = "move";
          return;
        }
      }
  }


  // dragging
  function Dragging(e) {


    if (drag) {
      e = MousePos(e);
      ploint[drag].x += e.x - dploint.x;
      ploint[drag].y += e.y - dploint.y;

      ploint[drag].y = Math.max(20,Math.min(240, ploint[drag].y));
      dploint = e;
      DrawCanvas();
    }

    ploint.p4.x = ploint.p1.x;
    ploint.p4.y = 245 + Math.abs(245 - ploint.p1.y);

    ploint.cp4a.x = ploint.cp1a.x;
    ploint.cp4a.y = 245 + Math.abs(245 - ploint.cp1a.y);

    ploint.cp4b.x = ploint.cp1b.x;
    ploint.cp4b.y = 245 + Math.abs(245 - ploint.cp1b.y);


    ploint.p3.x = ploint.p2.x;
    ploint.p3.y = 245 + Math.abs(245 - ploint.p2.y);

    ploint.cp3a.x = ploint.cp2a.x;
    ploint.cp3a.y = 245 + Math.abs(245 - ploint.cp2a.y);

    ploint.cp3b.x = ploint.cp2b.x;
    ploint.cp3b.y = 245 + Math.abs(245 - ploint.cp2b.y);
  }


  // end dragging
  function DragEnd(e) {
    var p = JSON.stringify(ploint);
    if (history[history.length-1] != p) {
      history.push(p);
    }
    drag = null;
    canvas.style.cursor = "default";
    DrawCanvas();
  }


  // event parser
  function MousePos(event) {
    event = (event ? event : window.event);
    return {
      x: event.pageX - canvas.offsetLeft,
      y: event.pageY - canvas.offsetTop
    }
  }


  // start
  canvas = document.getElementById("2d");
  code = document.getElementById("code");
  if (canvas.getContext) {
    ctx = canvas.getContext("2d");
    Init(canvas.className == "quadratic");
  }

})();
