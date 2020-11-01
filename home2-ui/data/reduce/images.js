const imagesApiUrl = "/images";
const pageUrl = page => page ? `${imagesApiUrl}?page=${page}` : imagesApiUrl;

export function useImages(page) {
    const {data} = useImagesLoader(page);
    return useMemo(() => {
        if (!data) return data;
        const {images, pagination} = data;
        return {pagination, images: images.map(toInternalImageData)};
    }, [data]);
}

export function useImagesTotalCount(page) {
    const {data} = useImagesLoader(page);
    return data?.pagination?.total;
}

export function useImagesLoading(page) {
    const result = useImagesLoader(page);
    return useLoadingStatus(result);
}

export function useImageUploader(page) {
    const [status, setStatus] = useState();
    const [error, setError] = useState();
    const uploader = useCallback(async (name, file) => {
        setStatus(Uploading.UPLOADING);
        try {
            await superagentUploadFile(imagesApiUrl, name, file);
            setStatus(Uploading.UPLOADED);
            await mutate(pageUrl(page));
        } catch (e) {
            console.error(`Error uploading image ${name}`, e);
            setStatus(Uploading.ERROR);
            setError(e?.message || e);
        }
    }, [page]);
    return { status, error, uploader };
}

export function useImageDeleter(page) {
    return useDeleter(pageUrl(page));
}

function useImagesLoader(page) {
    return useSWR(pageUrl(page), superagentFetch);
}

function asImgSrc(id) {
    let apiPrefix = config.api.prefix;
    return `${apiPrefix}/images/${id}`;
}

function toInternalImageData(image) {
    let result = Object.assign({}, image);
    result.src = asImgSrc(image.id);
    result.uploadedDateTime = image.uploaded["$date"];
    result.description = image.metadata && image.metadata.description;
    delete result.metadata;
    return result;
}
