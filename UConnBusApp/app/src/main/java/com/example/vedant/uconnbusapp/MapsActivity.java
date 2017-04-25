package com.example.vedant.uconnbusapp;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.design.widget.NavigationView;
import android.support.v4.app.ActivityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.Toolbar;
import android.widget.ZoomControls;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.location.LocationListener;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import java.util.ArrayList;
import java.lang.Math;

import java.io.IOException;
import java.util.List;

public class MapsActivity extends AppCompatActivity implements OnMapReadyCallback, GoogleApiClient.ConnectionCallbacks, GoogleApiClient.OnConnectionFailedListener, LocationListener {

    private GoogleMap mMap;
    private final static int MY_PERMISSION_FINE_LOCATION = 101;
    ZoomControls zoom;
    Button markBt;
    Button Navigation;
    Button clear;
    Button geoLocationBt;
    Double myLatitude = null;
    Double myLongitude = null;
    private GoogleApiClient googleApiClient;
    private LocationRequest locationRequest;
    private TextView get_places;
    private String[] mPlanetTitles;
    private ListView mDrawerList;
    protected static final String TAG = "MapsActivity";
    private ArrayList<Marker> markers = new ArrayList<Marker>();
    private ArrayList<LatLng> latLngs = new ArrayList<LatLng>();
    private DrawerLayout mDrawer;
    private Toolbar toolbar;
    private NavigationView nvDrawer;
    private ActionBarDrawerToggle drawerToggle;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_maps);
        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);

        googleApiClient = new GoogleApiClient.Builder(this)
                .addApi(LocationServices.API)
                .addConnectionCallbacks(this)
                .addOnConnectionFailedListener(this).build();

        locationRequest = new LocationRequest();
        locationRequest.setInterval(15 * 1000);
        locationRequest.setFastestInterval(5 * 1000);
        locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
        //set to balanced power accuracy on real device

        zoom = (ZoomControls) findViewById(R.id.zcZoom);
        zoom.setOnZoomOutClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                mMap.animateCamera(CameraUpdateFactory.zoomOut());

            }
        });
        zoom.setOnZoomInClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                mMap.animateCamera(CameraUpdateFactory.zoomIn());


            }
        });

        /*Navigation = (Button) findViewById(R.id.Navigation);
        Navigation.setOnClickListener(new View.OnClickListener() {

            @Override
             public void onClick(View v) {
                startActivity(new Intent(getApplicationContext(),NavigationDrawer.class));
              }
         });
         */

                markBt = (Button) findViewById(R.id.btMark);
        markBt.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                LatLng myLocation = new LatLng(myLatitude, myLongitude);
                mMap.addMarker(new MarkerOptions().position(myLocation).title("My Location"));
            }
        });

        geoLocationBt = (Button) findViewById(R.id.btSearch);
        geoLocationBt.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                EditText searchText = (EditText) findViewById(R.id.etLocationEntry);
                String search = searchText.getText().toString(); //that we don't pass null screen or black screen otherwise it would crash.
                if (!search.equals("")) {
                    List<android.location.Address> addressList = null;
                    Geocoder geocoder = new Geocoder(MapsActivity.this);
                    try {
                        addressList = geocoder.getFromLocationName(search, 1);
                        Address address = addressList.get(0); //we want to store the Address into address object in Android class.
                        latLngs.add(new LatLng(address.getLatitude(), address.getLongitude()));
                        mMap.addMarker(new MarkerOptions().position(latLngs.get(latLngs.size() - 1)).title("from geocoder"));
                        mMap.animateCamera(CameraUpdateFactory.newLatLng(latLngs.get(latLngs.size() - 1)));
                        // new thread here latLngs.get(latLngs.size() - 1).latitude
                    } catch (Exception e) {//(IOException e) {
                        // silently fail like a boss (no actually this is terrible we should fix it later)
                        //e.printStackTrace();
                    }

                }
            }
        });

    }


    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;

        // Add a marker in Storrs CT and move the camera
        latLngs.add(new LatLng(41.807422, -72.254040));
        // Move the camera instantly to location with a zoom of 15.
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(latLngs.get(0), 16));
        // Zoom in, animating the camera.
        mMap.animateCamera(CameraUpdateFactory.zoomTo(15), 2000, null);
        for (int i = 0; i < 100; i++) { // make 36 markers for lols
            markers.add(mMap.addMarker(new MarkerOptions().position(latLngs.get(0))));
            markers.get(i).setVisible(false);
        }
        mMap.addMarker(new MarkerOptions().position(latLngs.get(0)).title("UConn Storrs, CT"));

        // test code pls remove
        String[] icons = {"Blue Bus Logo.png",
                "Charters and Specials Bus Logo.png",
                "Green Bus Logo.png",
                "Late Night Bus Logo.png",
                "Orange Bus Logo.png",
                "Purple Bus Logo.png",
                "Red Bus Logo.png",
                "Silver Bus Logo.png",
                "Storm Shuttles Bus Logo.png",
                "UCONN Health Bus Logo.png",
                "Yellow Bus Logo.png"};
        for (int i = 0; i < 36; i++) {
            markers.get(i).setPosition(new LatLng(latLngs.get(0).latitude + 0.001 * i * Math.cos(i*10),
                    latLngs.get(0).longitude + 0.001 * i * Math.sin(i*10)));
            markers.get(i).setIcon(BitmapDescriptorFactory.fromAsset(icons[i % icons.length]));
            markers.get(i).setVisible(true);
        }

        for (int i = 15; i < 60; i++) {
            SystemClock.sleep(1);
            final int finalI = i;
            new Thread(new Runnable() {
                public void run() {
                    BusPositionUpdater updater = new BusPositionUpdater((byte) finalI);
                    while (true) {
                        BusLocationDatagram dgram = updater.updatePosition();
                        SystemClock.sleep(2000);
                        final BusLocationDatagram tmpdgram = dgram;
                        findViewById(R.id.btMark).post(new Runnable() { // this assumes the mark button is permanent...
                            public void run() {
                                try {
                                    markers.get(finalI).setPosition(new LatLng(tmpdgram.latitude, tmpdgram.longitude));
                                    markers.get(finalI).setIcon(BitmapDescriptorFactory.defaultMarker((float)4.0*finalI));
                                    markers.get(finalI).setVisible(true);
                                } catch (Exception e) {
                                    //System.out.print(e);
                                    //int a = 1 / 0;
                                }
                            }
                        });
                    }
                }
            }).start();
        }


        // This is help add a marker to any location that we like/visit.
        mMap.setOnMapClickListener(new GoogleMap.OnMapClickListener() {
            @Override
            public void onMapClick(LatLng latLng) {
                mMap.addMarker(new MarkerOptions().position(latLng).title("from onMapClick"));
                mMap.animateCamera(CameraUpdateFactory.newLatLng(latLng));
            }
        });

        //This would clear the marker on the Map.
        clear = (Button) findViewById(R.id.btClear);
        clear.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
              mMap.clear();
            }
        });


        //float zoomLevel = 16.0;
        // mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(latLng, zoomLevel));


        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            mMap.setMyLocationEnabled(true);
        } else {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, MY_PERMISSION_FINE_LOCATION);
            }
        }

        /*PlaceAutocompleteFragment autocompleteFragment = (PlaceAutocompleteFragment) //This is search suggestions.
        getFragmentManager().findFragmentById(R.id.place_autocomplete_fragment);

         autocompleteFragment.setOnPlaceSelectedListener(new PlaceSelectionListener() {
            @Override
            public void onPlaceSelected(Place place) {
                // TODO: Get info about the selected place.
                Log.i(TAG, "Place: " + place.getName());
            }

            @Override
            public void onError(Status status) {
                // TODO: Handle the error.
                Log.i(TAG, "An error occurred: " + status);
            }

        }
        ); */



    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        switch (requestCode) {
            case MY_PERMISSION_FINE_LOCATION:
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                        mMap.setMyLocationEnabled(true);
                    }

                } else {
                    Toast.makeText(getApplicationContext(), "This app requires location permissions to be granted", Toast.LENGTH_LONG).show();
                    finish();
                }
                break;
        }
    }

    @Override
    public void onConnected(@Nullable Bundle bundle) {
        requestLocationUpdates();
    }

    private void requestLocationUpdates() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            LocationServices.FusedLocationApi.requestLocationUpdates(googleApiClient, locationRequest, this);
        }



    }

    @Override
    public void onConnectionSuspended(int i) {
        Log.i(TAG, "Connection Suspended");

    }

    @Override
    public void onConnectionFailed(@NonNull ConnectionResult connectionResult) {
        Log.i(TAG, "Connection Failed: ConnectionResult.getErrorCode() = " + connectionResult.getErrorMessage());
    }

    @Override // Getting my Location and Latitude
    public void onLocationChanged(Location location) {
        myLatitude = location.getLatitude();
        myLongitude = location.getLongitude();
    }

    @Override
    protected void onStart() {
        super.onStart();
        googleApiClient.connect();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED)
            LocationServices.FusedLocationApi.removeLocationUpdates(googleApiClient, this);
    }

    @Override //The activity will go in the background.
    protected void onResume() {
        super.onResume();
        if (googleApiClient.isConnected()) {
            requestLocationUpdates();

        }
    }

    @Override
    protected void onStop() {
        super.onStop();
        googleApiClient.disconnect();
    }


}








