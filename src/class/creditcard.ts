import { Utils, IHttpRequestOptions, HttpRequestMethodEnum } from "./utils";
import { CieloTransactionInterface } from "../interface/cielo-transaction.interface";
import camelcaseKeys from "camelcase-keys";
import {
  TransactionCreditCardResponseModel,
  TransactionCreditCardRequestModel,
  CaptureRequestModel,
  CaptureResponseModel,
  CancelTransactionRequestModel,
  CancelTransactionResponseModel,
} from "../models/credit-card";

export class CreditCard {
  private cieloTransactionParams: CieloTransactionInterface;

  constructor(transaction: CieloTransactionInterface) {
    this.cieloTransactionParams = transaction;
  }

  public transaction(
    transaction: TransactionCreditCardRequestModel
  ): Promise<TransactionCreditCardResponseModel> {
    return new Promise<TransactionCreditCardResponseModel>(
      (resolve, reject) => {
        const util = new Utils();
        const options: IHttpRequestOptions = {
          method: HttpRequestMethodEnum.POST,
          path: "/1/sales",
          hostname: this.cieloTransactionParams.hostnameTransacao,
          port: 443,
          encoding: "utf-8",
          headers: {
            MerchantId: this.cieloTransactionParams.merchantId,
            MerchantKey: this.cieloTransactionParams.merchantKey,
            RequestId: this.cieloTransactionParams.requestId || "",
            "Content-Type": "application/json",
          },
        };

        util
          .httpRequest(options, transaction)
          .then((response) => {
            return resolve(
              camelcaseKeys(response.data, {
                deep: true,
              }) as TransactionCreditCardResponseModel
            );
          })
          .catch((err) => {
            reject(err);
          });
      }
    );
  }

  public captureSaleTransaction(
    transaction: CaptureRequestModel
  ): Promise<CaptureResponseModel> {
    return new Promise<CaptureResponseModel>((resolve, reject) => {
      const util = new Utils();
      const options: IHttpRequestOptions = {
        method: HttpRequestMethodEnum.PUT,
        path: `/1/sales/${transaction.paymentId}/capture`,
        hostname: this.cieloTransactionParams.hostnameTransacao,
        port: 443,
        encoding: "utf-8",
        headers: {
          MerchantId: this.cieloTransactionParams.merchantId,
          MerchantKey: this.cieloTransactionParams.merchantKey,
          RequestId: this.cieloTransactionParams.requestId || "",
          "Content-Type": "application/json",
        },
      };

      if (transaction.amount && transaction.amount < 0) {
        options.path = `${options.path}?amount=${transaction.amount}`;
      }

      util
        .httpRequest(options, {})
        .then((response) => {
          return resolve(
            camelcaseKeys(response.data, { deep: true }) as CaptureResponseModel
          );
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  public cancelTransaction(cancelTransactionRequest: CancelTransactionRequestModel): Promise<CancelTransactionResponseModel> {
    return new Promise<CancelTransactionResponseModel>((resolve, reject) => {
      const util = new Utils();
      // Caso seja passado o valor do cancelamento, adiciona na url
      const amount = (cancelTransactionRequest.amount) ? `?amount=${cancelTransactionRequest.amount}` : '';
      const path = (cancelTransactionRequest.paymentId) ? `/1/sales/${cancelTransactionRequest.paymentId}/void${amount}` : `/1/sales/OrderId/${cancelTransactionRequest.merchantOrderId}/void${amount}`
      const options: IHttpRequestOptions = {
        method: HttpRequestMethodEnum.PUT,
        path: path,
        hostname: this.cieloTransactionParams.hostnameTransacao,
        port: 443,
        encoding: "utf-8",
        headers: {
          MerchantId: this.cieloTransactionParams.merchantId,
          MerchantKey: this.cieloTransactionParams.merchantKey,
          RequestId: this.cieloTransactionParams.requestId || "",
          "Content-Type": "application/json",
        },
      };

      util
        .httpRequest(options, {})
        .then((response) => {
          return resolve(
            camelcaseKeys(response.data, { deep: true }) as CancelTransactionResponseModel
          );
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
