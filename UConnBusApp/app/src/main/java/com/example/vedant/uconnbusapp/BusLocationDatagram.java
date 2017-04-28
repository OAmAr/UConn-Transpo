package com.example.vedant.uconnbusapp;

/** Parse the information out of a Bus Location Datagram.
 *
 * @author Cameron Morris
 */

public class BusLocationDatagram {
    public byte flags;
    public byte seconds;
    public short heading;
    public short RouteID;
    public short VehicleID;
    public float latitude;
    public float longitude;
    public float groundSpeed;

    /** Construct a BusLocationDatagram from a byte array containing packet data.
     *
     * Make sure the byte array contains actual packet data or this will error.
     * @param buffer Byte array containing packet data (big endian).
     */
    BusLocationDatagram(byte[] buffer) {
        java.nio.ByteBuffer wrapped = java.nio.ByteBuffer.wrap(buffer);
        flags = wrapped.get();
        seconds = wrapped.get();
        heading = wrapped.getShort();
        RouteID = wrapped.getShort();
        VehicleID = wrapped.getShort();
        latitude = wrapped.getFloat();
        longitude = wrapped.getFloat();
        groundSpeed = wrapped.getFloat();
    }

    BusLocationDatagram() {}

    void updateInfo(byte[] buffer) {
        java.nio.ByteBuffer wrapped = java.nio.ByteBuffer.wrap(buffer);
        flags = wrapped.get();
        seconds = wrapped.get();
        heading = wrapped.getShort();
        RouteID = wrapped.getShort();
        VehicleID = wrapped.getShort();
        latitude = wrapped.getFloat();
        longitude = wrapped.getFloat();
        groundSpeed = wrapped.getFloat();
    }
}
