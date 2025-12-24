import express from 'express'
import { AddHomePageData } from '../../controllers/adminController/HomePageController.js';
import { HomeImagesUpload } from '../../../utils/multer.js';

const homeRouter = express.Router(); 
homeRouter.post("/add-home-details",HomeImagesUpload,AddHomePageData)

export default homeRouter;