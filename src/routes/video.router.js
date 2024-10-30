import express from 'express';
import { getListVideo, getTyppeDetails, getTyppeVideo, getVideoPage, getVideo, searchVideo, uploadVideoAndThumbnail, getVideosByUserId } from '../controllers/video.controller.js';
import { middlewareToken, middlewareTokenAsyncKey } from '../config/jwt.js';
import { uploadForVideo } from '../config/upload.js';

const videoRoutes =express.Router();
videoRoutes.get("/get-list-videos",getListVideo);
videoRoutes.get("/get-types",middlewareTokenAsyncKey,getTyppeVideo);
videoRoutes.get("/get-typpes-details/:typeID",getTyppeDetails);
videoRoutes.get("/get-video-page/:page/:size",getVideoPage);
videoRoutes.get("/get-video/:videoid",getVideo);
videoRoutes.get("/search-video",searchVideo);
videoRoutes.post('/upload-video/:userId', uploadForVideo.fields(
    [
        { name: 'source', maxCount: 1 }, 
        { name: 'thumbnail', maxCount: 1 }
    ]), uploadVideoAndThumbnail);

videoRoutes.get('/get-video-by-useid/:userId',getVideosByUserId);

export default videoRoutes;