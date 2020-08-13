from tensorflow.keras.models import load_model
import numpy

model = load_model('champs_model.h5')

arr = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]
numpy_arr = numpy.array(arr)
prediction = model.predict(x=numpy_arr, batch_size=32, verbose=0)
print(prediction[0][0])



