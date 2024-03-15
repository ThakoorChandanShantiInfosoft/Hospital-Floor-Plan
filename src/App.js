import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { Rnd } from 'react-rnd';
import { Button, Tooltip, TextField, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [rectangles, setRectangles] = useState([]);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [floor, setFloor] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRectId, setEditingRectId] = useState(null);
  const [patientInfo, setPatientInfo] = useState({});
  const [editingPatientData, setEditingPatientData] = useState({});
  const [draggingImage, setDraggingImage] = useState(false);
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);
  const [showUploadPrompt, setShowUploadPrompt] = useState(true); 

  const initialLoad = useRef(true);

  
  useEffect(() => {
    const savedData = localStorage.getItem('hospitalLayoutData');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data && data.uploadedImage !== undefined && data.rectangles !== undefined && data.imagePosition !== undefined && data.floor !== undefined && data.patientInfo !== undefined) {
        setUploadedImage(data.uploadedImage);
        setRectangles(data.rectangles);
        setImagePosition(data.imagePosition);
        setFloor(data.floor);
        setPatientInfo(data.patientInfo);
        setShowUploadPrompt(!data.uploadedImage);
      }
    }
    initialLoad.current = false;
  }, []);

  useEffect(() => {
    if (!initialLoad.current) {
      const data = {
        uploadedImage,
        rectangles,
        imagePosition,
        floor,
        patientInfo,
      };
      if (uploadedImage !== null) {
        localStorage.setItem('hospitalLayoutData', JSON.stringify(data));
      }
    }
  }, [uploadedImage, rectangles, imagePosition, floor, patientInfo]);

  const handleImageUpload = (event) => {
    const files = event.target.files || event.dataTransfer.files;
    const file = files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setShowUploadPrompt(false);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select a valid image file (JPEG or PNG).");
    }
  };

  const triggerFileInput = () => {
    if (!uploadedImage) {
      document.getElementById('contained-button-file').click();
    }
  };

  const startDragImage = (event) => {
    setDraggingImage(true);
    setStartDragPosition({
      x: event.clientX - imagePosition.x,
      y: event.clientY - imagePosition.y,
    });
  };

  const onImageMouseMove = (event) => {
    if (draggingImage) {
      const newX = event.clientX - startDragPosition.x;
      const newY = event.clientY - startDragPosition.y;
      setImagePosition({ x: newX, y: newY });
    }
  };

  const endDragImage = () => {
    setDraggingImage(false);
  };

  const addRectangle = () => {
    if (!uploadedImage || !floor) {
      alert("Please upload an image and select a floor before adding a bed.");
      return;
    }
    const newId = rectangles.length + 1;
    const defaultBedNumber = `${floor} - Bed ${newId}`;
    setRectangles((prevRectangles) => [
      ...prevRectangles,
      {
        id: newId,
        x: 70,
        y: 45,
        width: 100,
        height: 40,
        rotation: 0,
      },
    ]);
    setPatientInfo((prev) => ({
      ...prev,
      [newId]: { bedNumber: defaultBedNumber },
    }));
  };

  const removeRectangle = (id) => {
    setRectangles((prevRectangles) => prevRectangles.filter(rect => rect.id !== id));
    setPatientInfo((prev) => {
      const updatedInfo = { ...prev };
      delete updatedInfo[id];
      return updatedInfo;
    });
  };

  const removeImage = () => {
    setUploadedImage(null);
    setRectangles([]);
    setImagePosition({ x: 0, y: 0 });
    setFloor('');
    setPatientInfo({});
    setShowUploadPrompt(true);
  };

  const openModal = (id) => {
    setEditingRectId(id);
    const existingData = patientInfo[id];
    if (existingData) {
      setEditingPatientData(existingData);
    } else {
      setEditingPatientData({});
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingPatientData({});
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formProps = Object.fromEntries(formData);
    setPatientInfo((prev) => ({ ...prev, [editingRectId]: formProps }));
    closeModal();
  };

  return (
    <div className="App">
      <div className='button-container'>
        <div>
          <input
            accept="image/jpeg,image/png"
            style={{ display: 'none' }}
            id="contained-button-file"
            multiple
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="contained-button-file">
            <Button variant="contained" color="primary" component="span">
              Upload Image
            </Button>
          </label>
        </div>
        <FormControl
          variant="outlined"
        >
          <InputLabel
            id="floor-label"
            sx={{
              lineHeight: '1.4375em', 
              marginTop: '-6px', 
              backgroundColor: 'white', 
              paddingRight: '4px', 
            }}
          >
            Floor
          </InputLabel>
          <Select
            labelId="floor-label"
            id="floor-select"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            label="Floor"
            sx={{
              height: '40px', 
              width: '140px',
              paddingTop: '0px', 
              paddingBottom: '0px', 
              '.MuiSelect-select': {
                paddingTop: '8px', 
                paddingBottom: '8px', 
              },
            }}
          >
            <MenuItem value="Floor 1">Floor 1</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={addRectangle} style={{ marginLeft: 10 }}>
          Add Bed
        </Button>
        <Button variant="contained" color="primary" onClick={removeImage} style={{ marginLeft: 10 }}>
          Remove Image
        </Button>
      </div>
      <div
        className="image-container"
        ref={imageContainerRef}
        onClick={triggerFileInput} 
        style={{
          width: '1020px',
          height: '600px',
          overflow: 'hidden',
          position: 'relative',
          border: '0.5px solid grey',
          borderRadius: '7px',
          margin: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: showUploadPrompt && !uploadedImage ? 'pointer' : 'default',
        }}
        onMouseDown={startDragImage}
        onMouseMove={onImageMouseMove}
        onMouseUp={endDragImage}
        onMouseLeave={endDragImage}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleImageUpload}
      >
        {showUploadPrompt && !uploadedImage && (
          <div style={{ textAlign: 'center', cursor: 'pointer' }}>
            Click here to upload png/jpeg
          </div>
        )}
        <div
          style={{
            transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}
        >
          {uploadedImage && (
            <img src={uploadedImage} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable="false" />
          )}
          {rectangles.map((rect) => (
            <Rnd
              key={rect.id}
              size={{ width: rect.width, height: rect.height }}
              position={{ x: rect.x, y: rect.y }}
              onDragStart={(e) => e.stopPropagation()}
              onDragStop={(e, d) => {
                const updatedRects = rectangles.map(r =>
                  r.id === rect.id ? { ...r, x: d.x, y: d.y } : r
                );
                setRectangles(updatedRects);
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const updatedRects = rectangles.map(r =>
                  r.id === rect.id ? { ...r, width: ref.offsetWidth, height: ref.offsetHeight, x: position.x, y: position.y } : r
                );
                setRectangles(updatedRects);
              }}
              bounds="parent"
              style={{ position: 'absolute', zIndex: 5 }}

            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  backgroundColor: '#B0E0E6',
                  border: '1px solid #1E90FF',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onDoubleClick={() => openModal(rect.id)}
              >
                {patientInfo[rect.id] && (
                  <div style={{
                    position: 'absolute',
                    zIndex: 10,
                    pointerEvents: 'none',
                    fontSize: `${Math.max(8, rect.width / 15)}px`,
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}>
                    Bed: {patientInfo[rect.id].bedNumber}
                  </div>
                )}
                <IconButton size="small" onClick={() => removeRectangle(rect.id)} style={{ position: 'absolute', top: '-12px', right: '0', height: '10px', width: '10px', zIndex: 20 }}>
                  <DeleteIcon style={{ fontSize: '10px', color: 'red' }} />
                </IconButton>
                {patientInfo[rect.id] && (
                  <Tooltip
                    title={
                      <React.Fragment>
                        {Object.entries(patientInfo[rect.id])
                          .filter(([key, value]) => value)
                          .map(([key, value], index) => (
                            <div key={index} style={{ margin: '4px 0' }}>
                              <b>{key.charAt(0).toUpperCase() + key.slice(1)}:</b> {value}
                            </div>
                          ))}
                      </React.Fragment>
                    }
                    placement="top"
                    arrow
                  >
                    <AccountBoxIcon style={{ position: 'absolute', top: '-12px', right: '10px', height: '10px', width: '10px', zIndex: 20, cursor: 'pointer', color: 'grey' }} />
                  </Tooltip>
                )}
              </div>
            </Rnd>
          ))}

        </div>
      </div>
      <Dialog open={modalVisible} onClose={closeModal}>
        <DialogTitle>Edit Patient Information</DialogTitle>
        <DialogContent>
          <form onSubmit={handleFormSubmit}>
            <TextField
              margin="dense"
              label="Name"
              type="text"
              fullWidth
              name="name"
              required
              defaultValue={editingPatientData.name || ''}
            />
            <TextField
              margin="dense"
              label="Age"
              type="number"
              fullWidth
              name="age"
              required
              defaultValue={editingPatientData.age || ''}
            />
            <TextField
              margin="dense"
              label="Type of disease"
              type="text"
              fullWidth
              name="disease"
              required
              defaultValue={editingPatientData.disease || ''}
            />
            <TextField
              margin="dense"
              label="Bed number"
              type="text"
              fullWidth
              name="bedNumber"
              required
              defaultValue={editingPatientData.bedNumber || ''}
            />
            <DialogActions>
              <Button onClick={closeModal}>Cancel</Button>
              <Button type="submit">Submit</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
