const Banner = require("../models/banner.model")
const cloudinary = require("../utils/cloudinary.utils");
const status = require("http-status");

exports.insertBanner = async (req, res) => {
    try {

        const cloudinaryImageUploadMethod = async file => {
            return new Promise(resolve => {
                cloudinary.uploader.upload(file, (err, res) => {
                    if (err) return err
                    resolve({
                        res: res.secure_url
                    })
                } 
                )
            })
        }
    
        const urls = []
        const files = req.files;
    
        for (const file of files) {
            const { path } = file
            console.log("path::", path);
    
            const newPath = await cloudinaryImageUploadMethod(path)
            urls.push(newPath)
        }
    
        const addBanner = Banner({
            image: urls
        });
        const saveData = await addBanner.save();
    
        res.status(status.CREATED).json(
            {
                message: "Banner Insert Successfully",
                status: true,
                code: 201,
                statusCode: 1,
                data: saveData
            }
        )
        
    } catch (error) {

        console.log("Error::", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            {
                message: "Something Went Wrong",
                status: false,
                code: 500,
                statusCode: 0,
                error: error.message
            }
        )
        
    }
}

exports.getBanner = async (req, res) => {
    try {

        const findBanner = await Banner.findOne({ _id: req.params.id });

        if(findBanner) {

            res.status(status.OK).json(
                {
                    message: "Banner View Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: findBanner
                }
            )

        } else {

            res.status(status.NOT_FOUND).json(
                {
                    message: "Banner Not Exist",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )

        }
        
    } catch (error) {

        console.log("Error::", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            {
                message: "Something Went Wrong",
                status: false,
                code: 500,
                statusCode: 0,
                error: error.message
            }
        )
        
    }
}

exports.getAllBanner = async (req, res) => {
    try {

        const findBanner = await Banner.find({});

        if(findBanner[0] == undefined) {

            res.status(status.NOT_FOUND).json(
                {
                    message: "Banner Not Exist",
                    status: false,
                    code: 404,
                    statusCode: 0
                }
            )

        } else {

            res.status(status.OK).json(
                {
                    message: "All Banner View Successfully",
                    status: true,
                    code: 200,
                    statusCode: 1,
                    data: findBanner
                }
            )

        }
        
    } catch (error) {

        console.log("Error::", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            {
                message: "Something Went Wrong",
                status: false,
                code: 500,
                statusCode: 0,
                error: error.message
            }
        )
        
    }
}