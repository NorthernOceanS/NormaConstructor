import { Coordinate } from '../constructor'
let utils = {
    geometry: {
        transform: function (f, g, h) {
            return (coordinate) => {
                return new Coordinate(
                    f(coordinate.x, coordinate.y, coordinate.z),
                    g(coordinate.x, coordinate.y, coordinate.z),
                    h(coordinate.x, coordinate.y, coordinate.z),
                )
            }
        },
        generateLine: function (x, y, z, t_span, t_step) {

            //TODO: t_step<0?t_span[0]>t_span[1]?
            let coordinateArray = []
            for (let t = t_span[0]; t < t_span[1]; t += t_step) {
                let coordinate_new = new Coordinate(Math.floor(x(t)), Math.floor(y(t)), Math.floor(z(t)))
                if (coordinateArray.length == 0 ||
                    (coordinateArray[coordinateArray.length - 1].x != coordinate_new.x ||
                        coordinateArray[coordinateArray.length - 1].y != coordinate_new.y ||
                        coordinateArray[coordinateArray.length - 1].z != coordinate_new.z)
                ) coordinateArray.push(coordinate_new)
            }
            return coordinateArray
        },
        generateLineWithTwoPoints: function (x_start, y_start, z_start, x_end, y_end, z_end) {
            let t_span = [0, 1]
            let x_coefficient = (x_end - x_start) / (t_span[1] - t_span[0])
            let y_coefficient = (y_end - y_start) / (t_span[1] - t_span[0])
            let z_coefficient = (z_end - z_start) / (t_span[1] - t_span[0])
            return this.generateLine(
                (t) => { return ((t - t_span[0]) * x_coefficient + x_start) },
                (t) => { return ((t - t_span[0]) * y_coefficient + y_start) },
                (t) => { return ((t - t_span[0]) * z_coefficient + z_start) },
                t_span, 0.0001)
        }
    }
}

export { utils }