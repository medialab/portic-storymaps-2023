
import numpy as np
from sklearn.linear_model import LinearRegression
import math

def regress(region, growth, label):
    print()
    print("Regression computation for", region, label)
    x_arr = []
    y_arr = []
    for key in sorted(growth[region].keys()):
        value = growth[region][key]
        if value != 0:
            x_arr.append(int(key))
            y_arr.append(math.log(value))
    print(x_arr, y_arr)
    x = np.array(x_arr).reshape((-1, 1))
    y = np.array(y_arr)
    model = LinearRegression()
    model.fit(x, y)
    score = model.score(x, y)
    print("R²:", score)
    slope = model.coef_[0]
    print("slope:", slope)
    y0 = model.intercept_
    print("intercept:", y0)
    return (score, slope, y0)