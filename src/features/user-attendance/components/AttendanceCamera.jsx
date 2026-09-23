import {
  useEffect,
  useRef,
  useState,
} from "react";


// ============================================================
// CAMERA COMPONENT
// ============================================================

function AttendanceCamera({
  onCapture,
  onClose,
}) {
  const videoRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const [cameraError, setCameraError] =
    useState("");

  const [cameraReady, setCameraReady] =
    useState(false);

  const [capturing, setCapturing] =
    useState(false);


  // ==========================================================
  // START CAMERA
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const startCamera =
      async () => {
        try {
          setCameraError("");

          const stream =
            await navigator.mediaDevices.getUserMedia(
              {
                video: {
                  facingMode: {
                    ideal: "user",
                  },
                },
                audio: false,
              }
            );

          if (!mounted) {
            stream
              .getTracks()
              .forEach(
                (track) =>
                  track.stop()
              );

            return;
          }

          streamRef.current =
            stream;

          if (
            videoRef.current
          ) {
            videoRef.current.srcObject =
              stream;

            await videoRef.current.play();

            setCameraReady(true);
          }
        } catch (error) {
          console.error(
            "Camera access error:",
            error
          );

          setCameraError(
            "Camera access is required to mark attendance. Please allow camera permission and try again."
          );
        }
      };

    startCamera();

    return () => {
      mounted = false;

      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        streamRef.current = null;
      }
    };
  }, []);


  // ==========================================================
  // CAPTURE PHOTO
  // ==========================================================

  const handleCapture =
    () => {
      if (
        !videoRef.current ||
        !cameraReady
      ) {
        return;
      }

      setCapturing(true);

      const video =
        videoRef.current;

      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width =
        video.videoWidth;

      canvas.height =
        video.videoHeight;

      const context =
        canvas.getContext(
          "2d"
        );

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setCapturing(false);

            setCameraError(
              "Unable to capture photo. Please try again."
            );

            return;
          }

          const file =
            new File(
              [
                blob,
              ],
              `attendance-${Date.now()}.jpg`,
              {
                type: "image/jpeg",
              }
            );

          onCapture(file);

          setCapturing(false);
        },
        "image/jpeg",
        0.9
      );
    };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">

      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b px-5 py-4">

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Mark Attendance
            </h2>

            <p className="text-sm text-gray-500">
              Take your photo to mark attendance
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            ✕
          </button>

        </div>


        {/* CAMERA */}

        <div className="relative bg-black">

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="aspect-[3/4] w-full object-cover"
          />

          {!cameraReady &&
            !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />

                  <p>
                    Opening camera...
                  </p>
                </div>
              </div>
            )}

        </div>


        {/* ERROR */}

        {cameraError && (
          <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {cameraError}
          </div>
        )}


        {/* FOOTER */}

        <div className="flex gap-3 p-5">

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCapture}
            disabled={
              !cameraReady ||
              capturing
            }
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {capturing
              ? "Capturing..."
              : "Take Photo"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default AttendanceCamera;