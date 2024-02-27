import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

const WebcamComponent = () => {
    const webcamRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 627, height: 470 }); // Assuming default container size
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState({ width: 100, height: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [initialClick, setInitialClick] = useState({ x: 0, y: 0 });
    const [isResizing, setIsResizing] = useState(false); // Add this state variable
    const [inputWidth, setInputWidth] = useState(100);
    const [inputHeight, setInputHeight] = useState(100);

    useEffect(() => {
        const updateContainerSize = () => {
            const container = document.querySelector('.divs');
            if (container) {
                const rect = container.getBoundingClientRect();
                setContainerSize({ width: rect.width, height: rect.height });
            }
        };

        updateContainerSize(); // Initial update
        window.addEventListener('resize', updateContainerSize); // Update size on window resize

        return () => {
            window.removeEventListener('resize', updateContainerSize); // Clean up listener
        };
    }, []);

    useEffect(() => {
        console.log("Position:", position);
        console.log("Size:", size);
    }, [position, size]);

    const handleMouseDown = (e) => {
        if (isResizing) return;
        setIsDragging(true);
        setInitialClick({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const newX = Math.min(Math.max(e.clientX - initialClick.x, 0), containerSize.width - size.width);
        const newY = Math.min(Math.max(e.clientY - initialClick.y, 0), containerSize.height - size.height);
        setPosition({ x: newX, y: newY });
    };

    const handleWidthChange = (e) => {
        const newWidth = parseInt(e.target.value);
        if (!isNaN(newWidth) && newWidth >= 0 && newWidth <= containerSize.width) {
            setInputWidth(newWidth);
            setSize(prevSize => ({ ...prevSize, width: newWidth }));
        }
    };

    const handleHeightChange = (e) => {
        const newHeight = parseInt(e.target.value);
        if (!isNaN(newHeight) && newHeight >= 0 && newHeight <= containerSize.height) {
            setInputHeight(newHeight);
            setSize(prevSize => ({ ...prevSize, height: newHeight }));
        }
    };

    useEffect(() => {
        const captureVideo = async () => {
            const video = webcamRef.current.video;
            if (!video) {
                console.log("No camera attached. Please attach a camera.");
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg'));

            const formData = new FormData();
            formData.append('video', blob, 'video.jpg');
            formData.append('x', String(position.x)); // Convert to string
            formData.append('y', String(position.y)); // Convert to string
            formData.append('width', String(size.width)); // Convert to string
            formData.append('height', String(size.height)); // Convert to string
            // Send video data to Flask server
            sendVideoData(formData);
        };

        const intervalId = setInterval(captureVideo, 1000); // adjust the interval as needed
        return () => clearInterval(intervalId);
    }, [position, size]); // Include position and size in the dependencies

    // Function to send video data to Flask server
    const sendVideoData = async (formData) => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/endpoint', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Handle the response from the server if needed
            const responseData = await response.json();
            console.log('Server response:', responseData);
        } catch (error) {
            console.error('Error sending video data:', error.message);
        }
    };

    return (
        <div>
            <div>
                <Webcam
                    mirrored={true}
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                />
            </div>
            <div
                className="square"
                style={{
                    border: " 2px solid black",
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    position: 'absolute',
                }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            ></div>
            <div style={{ position: "relative" }} >
                <label>Width:</label>
                <input type="range" min="01" max={containerSize.width - position.x} value={inputWidth} onChange={handleWidthChange} />
            </div>
            <div>
                <label>Height:</label>
                <input type="range" min="01" max={containerSize.height - position.y} value={inputHeight} onChange={handleHeightChange} />
            </div>
        </div>
    );
};

export default WebcamComponent;
