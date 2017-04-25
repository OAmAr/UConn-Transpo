package com.example.vedant.uconnbusapp;

/**
 * Created by Vedant on 4/25/17.
 */


import java.io.UnsupportedEncodingException;
import java.lang.reflect.Method;
import java.util.Map;

import javax.xml.transform.ErrorListener;



public class BusQueryRequest {

    RequestQueue mRequestQueue;
    public class GsonRequest<T> extends Request<T> {
        private final Gson gson = new Gson();
        private final Class<T> clazz;
        private final Map<String, String> headers;
        private final Listener<T> listener;

        /**
         * Make a GET request and return a parsed object from JSON.
         *
         * url URL of the request to make
         *  clazz Relevant class object, for Gson's reflection
         *  headers Map of request headers
         */
        public GsonRequest(String url, Class<T> clazz, Map<String, String> headers,
                           Listener<T> listener, ErrorListener errorListener) {
            super(Method.GET, url, errorListener);
            this.clazz = clazz;
            this.headers = headers;
            this.listener = listener;
        }

        @Override
        public Map<String, String> getHeaders() throws AuthFailureError {
            return headers != null ? headers : super.getHeaders();
        }

        @Override
        protected void deliverResponse(T response) {
            listener.onResponse(response);
        }

        @Override
        protected Response<T> parseNetworkResponse(NetworkResponse response) {
            try {
                String json = new String(
                        response.data,
                        HttpHeaderParser.parseCharset(response.headers));
                return Response.success(
                        gson.fromJson(json, clazz),
                        HttpHeaderParser.parseCacheHeaders(response));
            } catch (UnsupportedEncodingException e) {
                return Response.error(new ParseError(e));
            } catch (JsonSyntaxException e) {
                return Response.error(new ParseError(e));
            }
        }
    }









}
