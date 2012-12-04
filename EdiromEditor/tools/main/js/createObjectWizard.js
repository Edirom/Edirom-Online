var buttonsEnabled = true;

function createNewObject(uri) {
	buttonsEnabled = false;

	window.location.href = uri;
}

function getSelectedOption() {
	return document.getElementById('objectTypes').value;
}

function dataListener(command) {

}