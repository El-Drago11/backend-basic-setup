import handleResponse from "../../../utils/http-response.js";
import HomePageSchema from "../../models/HomePageSchema.js";

export const AddHomePageData = async (req, res) => {
  try {
    const { banner_name } = req.body;
    const bannerFile = req.files?.banner_image?.[0];

    if (!banner_name || !bannerFile) {
      return handleResponse(res, 400, "Banner name and image are required");
    }

    const data = await HomePageSchema.create({
      banner_name,
      banner_image: bannerFile.filename,
    });

    return handleResponse(
      200,
      "Banner Saved Successfully!",
      data,
      res
    );
  } catch (error) {
    console.error(error);
    return handleResponse(500, "Internal Server Error",error.message,res);
  }
};
