package com.example.vedant.uconnbusapp;

import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.DatagramPacket;

/** Keep a specified BusLocationDatagram object updated.
 *
 * This socket never gets closed. Not sure how to implement a destructor in Java.
 *
 * @author Cameron Morris
 */

public class BusPositionUpdater {
    DatagramSocket sock;
    byte[] sendBuf;
    byte[] recvBuf;
    InetAddress address;
    byte vehicleID;

    BusPositionUpdater(byte vehicleID) {
        try {
            // send request
            this.sendBuf = new byte[4];
            sendBuf[3] = vehicleID;
            this.recvBuf = new byte[128]; // should only need 20 bytes but better safe than sorry
            this.address = InetAddress.getByName("137.99.157.145");
            this.vehicleID = vehicleID;
        } catch (Exception e) {
            // fail silently because yolo
        }
    }

    public BusLocationDatagram updatePosition() {
        try {
            DatagramSocket sock = new DatagramSocket();
            DatagramPacket packet = new DatagramPacket(sendBuf, sendBuf.length, address, 6269);
            sock.send(packet);
            packet = new DatagramPacket(recvBuf, recvBuf.length);
            sock.receive(packet);
            return new BusLocationDatagram(packet.getData());
        } catch (Exception e) {
            // this silent failure should actually stay
            System.out.print(e);
            return new BusLocationDatagram();
        }
    }
}
