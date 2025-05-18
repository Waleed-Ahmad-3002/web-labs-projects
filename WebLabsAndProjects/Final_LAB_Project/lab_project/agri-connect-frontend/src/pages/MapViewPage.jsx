// src/pages/MapViewPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 30.3753, // Default center (Pakistan)
  lng: 69.3451
};

const MapViewPage = () => {
  const [mapAddresses, setMapAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(5);
  const [filters, setFilters] = useState({
    latitude: '',
    longitude: ''
  });
  const mapRef = useRef(null);

  // Fetch all map addresses
  const fetchMapAddresses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/mapaddress/all`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch map addresses: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Map addresses response:', data);

      if (data.success && data.data) {
        // Log each address to help debug
        data.data.forEach((address, index) => {
          console.log(`Address ${index}:`, {
            id: address._id,
            lat: address.latitude,
            lng: address.longitude,
            user: address.user?.name || 'Unknown'
          });
        });

        setMapAddresses(data.data);

        // If we have addresses, center the map on the first one with valid coordinates
        if (data.data.length > 0) {
          const firstValidAddress = data.data.find(addr => {
            const lat = parseFloat(addr.latitude);
            const lng = parseFloat(addr.longitude);
            return !isNaN(lat) && !isNaN(lng);
          });

          if (firstValidAddress) {
            setCenter({
              lat: parseFloat(firstValidAddress.latitude),
              lng: parseFloat(firstValidAddress.longitude)
            });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching map addresses:', err);
      setError(err.message || 'Failed to fetch map addresses');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fit map to show all markers when data is loaded
  useEffect(() => {
    fetchMapAddresses();
  }, [fetchMapAddresses]);

  // Fit bounds when map addresses change
  useEffect(() => {
    if (mapRef.current && mapAddresses.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasValidCoordinates = false;

      mapAddresses.forEach(address => {
        if (address.latitude && address.longitude) {
          bounds.extend({ lat: address.latitude, lng: address.longitude });
          hasValidCoordinates = true;
        }
      });

      if (hasValidCoordinates) {
        mapRef.current.fitBounds(bounds);
      }
    }
  }, [mapAddresses]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    // Convert filter values to numbers
    const lat = filters.latitude ? parseFloat(filters.latitude) : null;
    const lng = filters.longitude ? parseFloat(filters.longitude) : null;

    // Validate filter values
    if ((lat !== null && isNaN(lat)) || (lng !== null && isNaN(lng))) {
      setError('Please enter valid numbers for latitude and longitude');
      return;
    }

    // If we have valid coordinates, center the map on them
    if (lat !== null && lng !== null) {
      setCenter({ lat, lng });
      setZoom(15); // Zoom in closer when searching for specific coordinates
    }

    // No need to refetch data, just filter the existing data
    if (mapRef.current && lat !== null && lng !== null) {
      // Center the map on the searched coordinates
      mapRef.current.panTo({ lat, lng });
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      latitude: '',
      longitude: ''
    });
    setCenter(defaultCenter);
    setZoom(5);

    // If we have map addresses, fit bounds to show all markers
    if (mapRef.current && mapAddresses.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      mapAddresses.forEach(address => {
        bounds.extend({ lat: address.latitude, lng: address.longitude });
      });
      mapRef.current.fitBounds(bounds);
    }
  };

  // Filter markers based on current filters
  const filteredMarkers = mapAddresses.filter(address => {
    const lat = filters.latitude ? parseFloat(filters.latitude) : null;
    const lng = filters.longitude ? parseFloat(filters.longitude) : null;

    // If no filters are applied, show all markers
    if (lat === null && lng === null) {
      return true;
    }

    // If only latitude is specified
    if (lat !== null && lng === null) {
      // Use a small threshold for floating point comparison (0.01 degrees is roughly 1.1 km)
      return Math.abs(address.latitude - lat) < 0.01;
    }

    // If only longitude is specified
    if (lat === null && lng !== null) {
      return Math.abs(address.longitude - lng) < 0.01;
    }

    // If both are specified, check both with a small threshold
    return Math.abs(address.latitude - lat) < 0.01 && Math.abs(address.longitude - lng) < 0.01;
  });

  // Handle map load
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Map View</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Latitude</Form.Label>
            <Form.Control
              type="text"
              name="latitude"
              value={filters.latitude}
              onChange={handleFilterChange}
              placeholder="Enter latitude (e.g., 33.6844)"
            />
            <Form.Text className="text-muted">
              Enter a specific latitude to search
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Longitude</Form.Label>
            <Form.Control
              type="text"
              name="longitude"
              value={filters.longitude}
              onChange={handleFilterChange}
              placeholder="Enter longitude (e.g., 73.0479)"
            />
            <Form.Text className="text-muted">
              Enter a specific longitude to search
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col className="d-flex justify-content-end">
          <Button variant="primary" onClick={applyFilters} className="me-2">
            Apply Filters
          </Button>
          <Button variant="secondary" onClick={resetFilters}>
            Reset Filters
          </Button>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading map data...</p>
            </div>
          ) : (
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
                onLoad={onMapLoad}
              >
                {filteredMarkers.map((address) => {
                  // Convert latitude and longitude to numbers to ensure they work with Google Maps
                  const lat = parseFloat(address.latitude);
                  const lng = parseFloat(address.longitude);

                  // Only render markers with valid coordinates
                  if (!isNaN(lat) && !isNaN(lng)) {
                    return (
                      <Marker
                        key={address._id}
                        position={{ lat, lng }}
                        onClick={() => setSelectedMarker(address)}
                      />
                    );
                  }
                  return null;
                })}

                {selectedMarker && (
                  <InfoWindow
                    position={{
                      lat: parseFloat(selectedMarker.latitude),
                      lng: parseFloat(selectedMarker.longitude)
                    }}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <div>
                      <h5>User: {selectedMarker.user?.name || 'Unknown'}</h5>
                      <p>Latitude: {selectedMarker.latitude}</p>
                      <p>Longitude: {selectedMarker.longitude}</p>
                      <p>User Type: {selectedMarker.user?.userType || 'Unknown'}</p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          )}
        </Card.Body>
      </Card>

      <div className="mt-4">
        <h4>Map Addresses ({filteredMarkers.length})</h4>
        {filteredMarkers.length === 0 ? (
          <Alert variant="info">No map addresses found.</Alert>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>User Type</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarkers.map((address) => (
                  <tr key={address._id}>
                    <td>{address.user?.name || 'Unknown'}</td>
                    <td>{address.latitude}</td>
                    <td>{address.longitude}</td>
                    <td>{address.user?.userType || 'Unknown'}</td>
                    <td>{new Date(address.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Container>
  );
};

export default MapViewPage;
