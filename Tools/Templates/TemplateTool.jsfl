/*
	Fichier représentant le squelette d'un outil en JSFL pour l'environnement Flash.
	Johann Bescond, mai 2017
*/

/*
	Variables globales de l'outil
*/

var didDrag = false;
var update = false;

/*
Fonction appelée à l'ouverture de Flash et lorsque l'outil extensible est chargé dans le panneau Outils. Elle permet de
définir toutes les informations dont Flash a besoin à propos de cet outil.
*/
function configureTool()
{
	var theTool = fl.tools.activeTool;
	theTool.setToolName("[Name] Tool");
	theTool.setMenuString("[Name] Tool");
	theTool.setToolTip("[Name] Tool");
	theTool.setIcon("[nametool].png");
	//theTool.setOptionsFile("nametool.xml");
	//theTool.showPIControl( "fill", false );

	theTool.setPI("shape");
}
/*
Cette fonction est appelée lorsqu’un outil est actif et que l’utilisateur en modifie les options dans l’inspecteur
Propriétés. Vous pouvez utiliser la propriété tools.activeTool pour demander les valeurs actuelles des options (voir
tools.activeTool).
*/ 
function notifySettingsChanged()
{
	// statements
}
/*
Cette fonction est appelée lorsque l'outil extensible est actif et que l'utilisateur déplace sa souris, ce qui permet au script
de définir des pointeurs personnalisés. Le script doit appeler tools.setCursor() pour désigner le pointeur à utiliser.
La liste des pointeurs et des valeurs entières correspondantes figure dans la section tools.setCursor().
*/
function setCursor()
{
	fl.tools.setCursor( 0 ); // type du curseur
}
/*
Fonction appelée lorsque l’outil extensible est activé (c’est-à-dire lorsqu’il est sélectionné dans le panneau Outils).
Cette fonction vous permet d'exécuter toute tâche d'initialisation requise par l'outil.
*/
function activate()
{
	// statements
}
/*
Cette fonction est appelée lorsque l’outil extensible est désactivé (c’est-à-dire lorsque l’utilisateur sélectionne un autre
outil). Elle permet d’effectuer toute opération de nettoyage nécessaire avant la désactivation de cet outil.
*/
function deactivate()
{
	// statements
}
/*
Cette fonction est appelée si l’outil extensible est actif lors d’un clic de souris alors que le pointeur se trouve sur la scène.
*/
function mouseDown()
{
	//fl.drawingLayer.beginDraw();
	//didDrag = false;
}
// Variante
/*
function mouseDown(pt) 
{
	fl.trace("x = "+ pt.x+" :: y = "+pt.y);
}
*/
/*
Fonction appelée lorsque l'outil extensible est actif et que l'utilisateur double-clique sur la scène.
*/
function mouseDoubleClick() 
{
	// statements
}

function mouseMove(mouseLoc)
{
	// statements
}
/*
Fonction appelée lorsque l'outil extensible est actif et que l'utilisateur relâche le bouton de sa souris après avoir cliqué
sur la scène.
*/
function mouseUp()
{
	// statements
}
/*
Cette fonction est appelée si l’outil extensible est actif lorsque l’utilisateur appuie sur une touche. Le script doit alors
appeler tools.getKeyDown() pour identifier la touche en question.
*/
function keyDown()
{
	// statements
}
/*
Cette fonction est appelée si l’outil extensible est actif lorsque l’utilisateur relâche une touche.
*/
function keyUp()
{
}

/*
	Functions spécifiques de l'outil
*/

//
function transformPoint(pt, mat)
{
	var x = pt.x*mat.a + pt.y*mat.c + mat.tx;
	var y = pt.x*mat.b + pt.y*mat.d + mat.ty;
	
	pt.x = x;
	pt.y = y;

	return;
}