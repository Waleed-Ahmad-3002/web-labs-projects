import mongoose from 'mongoose';
const mapAddressSchema = new mongoose.Schema(
{
user: {
type: mongoose.Schema.Types.ObjectId,
ref: 'User',
required: true,
unique: true // Each user can have only one map address
},
latitude: {
type: Number,
required: [true, 'Latitude is required'],
min: -90,
max: 90
},
longitude: {
type: Number,
required: [true, 'Longitude is required'],
min: -180,
max: 180
}
},
{
timestamps: true // Adds createdAt and updatedAt
}
);
// Index for efficient querying
mapAddressSchema.index({ user: 1 });
const MapAddress = mongoose.model('MapAddress', mapAddressSchema);
export default MapAddress;